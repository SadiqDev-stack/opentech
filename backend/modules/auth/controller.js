// controllers/userController.js
import User from "../models/user.js";
import Store from "../models/store.js";
import Bot from "../models/bot.js";
import Order from "../models/order.js";
import Notification from "../models/notification.js";
import {
  hash,
  compareHashes,
  setCookie,
  getTokenData,
  deleteCookie,
  createToken,
  createMessageToken,
} from "../utilities/general.js";
import { log } from "../middlewares/logger.js";
import { sendMail } from "../services/mail.js";
import {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordReset,
  validateUpdateSettings,
  validatePhone,
} from "../utilities/validators.js";
import Stat from "../models/stat.js";
import Log from "../models/log.js";

const { ADMIN_EMAIL, LOGIN_EXPIRE } = process.env;

export const userController = {
  // Register new user (any store owner - restaurant, shop, boutique, etc.)
  async register(req, res, next) {
    try {
      // Validate and sanitize input
      const validation = validateUserRegistration(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message:  validation.errors[0].message,
        });
      }

      // Get sanitized data
      const { fullname, email, phone, password } = validation.data;

      // Check existing user
      const existing = await User.findOne({ $or: [{ email }, { phone }] });
      if (existing) {
        return res.status(400).json({
          success: false,
          message:
            existing.email === email
              ? "User with this email already exists"
              : "User with this phone number already exists",
        });
      }

      const hashedPassword = await hash(password);
      const user = await User.create({
        fullname,
        email,
        phone,
        password: hashedPassword,
        role: email === ADMIN_EMAIL ? "admin" : "user",
      });

      if (!user) {
        throw new Error("Failed to create account");
      }

      const token = await createToken({
        _id: user._id.toString(),
        email: user.email,
      });
      req.token = token;

      sendMail({ email }, req, (sent) => {
        res.status(201).json({
          success: true,
          message: `Registration Successful! ${sent ? "Please check your email for verification." : "Please login to continue."}`,
          redirect: sent
            ? `/message?token=${createMessageToken({ title: "Registration Successful", description: "Please check your email (including spam folder) to verify your account", type: "success" })}`
            : false,
        });
        log(`${fullname} registered an account`);
      });
    } catch (er) {
      req.err = er;
      next();
    }
  },

  // Verify email
  async verify(req, res) {
    try {
      const { token = false, type = "email" } = req.query;

      if (!token) {
        return res.redirect(
          `${req.domain}/message?token=${createMessageToken({ title: "Invalid Token", description: "The token provided is invalid. Please login and try again.", type: "error", redirect: "/login" })}`,
        );
      }

      try {
        const {
          email = "",
          _id = "",
          newPassword = "",
        } = await getTokenData(token);
        let user = await User.findOne({ _id });

        if (!user) {
          throw new Error("User not found");
        }

        if (type === "email") {
          // Check if already verified
          if (user.emailVerified) {
            const destination = encodeURI(
              `${req.domain}/message?token=${createMessageToken({ title: "Already Verified", description: "Your email is already verified. You can now login to your dashboard.", type: "info", redirect: `/${user.role === "user" ? "user" : "admin"}/dashboard` })}`,
            );
            return res.redirect(destination);
          }

          // Update user
          user = await User.findByIdAndUpdate(
            user._id,
            {
              emailVerified: true,
              updatedAt: Date.now(),
              loginFailAttempt: 0,
            },
            { returnDocument: 'after' },
          );

          // Increment total users count
          await Stat.findOneAndUpdate(
            {},
            {
              $inc: {
                totalUsers: 1,
                totalUsersActive: 1,
              },
            },
            { upsert: true, returnDocument: 'after' },
          );

          setCookie(res, "token", token);
          const destination = encodeURI(
            `${req.domain}/message?token=${createMessageToken({ title: "Email Verified!", description: `Congratulations ${user.fullname}! Your email has been verified. You can now start using BusyPilot.`, type: "success", redirect: `/${user.role === "user" ? "user" : "admin"}/dashboard` })}`,
          );
          res.redirect(destination);
        } else if (type === "reset") {
          const hashedPassword = await hash(newPassword);
          user = await User.findByIdAndUpdate(
            user._id,
            {
              password: hashedPassword,
              updatedAt: Date.now(),
              loginFailAttempt: 0,
            },
            { returnDocument: 'after' },
          );

          const destination = encodeURI(
            `${req.domain}/message?token=${createMessageToken({ title: "Password Changed!", description: "Your password has been successfully changed.", type: "success", redirect: `/${user.role === "user" ? "user" : "admin"}/dashboard` })}`,
          );
          res.redirect(destination);
        } else if (type === "admin-login") {
          // Admin login verification - extra security layer
          // Only grant access if user still holds admin/super role
          if (user.role !== "admin" && user.role !== "super") {
            await Log.create({
              type: "system",
              event: "admin_login_denied",
              payload: {
                userId: user._id,
                email: user.email,
                role: user.role,
                reason: "role_no_longer_admin",
              },
            });

            const destination = encodeURI(
              `${req.domain}/message?token=${createMessageToken({ title: "Access Denied", description: "This account does not have admin privileges. Please contact support.", type: "error", redirect: "/login" })}`,
            );
            return res.redirect(destination);
          }

          // Create a fresh auth token and set the cookie
          const authToken = await createToken({
            _id: user._id.toString(),
            email: user.email,
          });
          setCookie(res, "token", authToken, parseInt(LOGIN_EXPIRE));

          // Update last login AND mark email as verified
          await User.findByIdAndUpdate(user._id, { 
            lastLogin: new Date(),
            emailVerified: true
          });

          await Log.create({
            type: "system",
            event: "admin_login_verified",
            payload: {
              admin: { id: user._id, email: user.email },
              ip: req.headers["x-forwarded-for"] || req.ip,
              userAgent: req.headers["user-agent"],
            },
          });

          log(`Admin ${user.email} verified login via email`);

          const destination = encodeURI(
            `${req.domain}/message?token=${createMessageToken({ title: "Login Verified!", description: `Welcome back ${user.fullname}! Your admin login has been verified. Redirecting to your dashboard.`, type: "success", redirect: "/admin/dashboard" })}`,
          );
          res.redirect(destination);
        }
      } catch (er) {
        throw new Error("Invalid or expired token");
      }
    } catch (er) {
      log(er, "bad");
      res.redirect("/login");
    }
  },

  // Login user
  async authenticate(req, res, next) {
    try {
      const validation = validateUserLogin(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message:  validation.errors[0].message,
        });
      }

      const { email, password } = validation.data;
      const user = req.user;

      const token = await createToken({
        _id: user._id.toString(),
        email: user.email,
      });

      const userData = {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
      };

      // Admin login verification - extra security layer
      // Admin must verify login via email link before the auth cookie is set

      if (user.role === "admin" || user.role === "super") {
        const adminLoginToken = await createToken({
          _id: user._id.toString(),
          email: user.email,
          type: "admin-login",
        });

        req.token = adminLoginToken;
        sendMail(
          {
            email: user.email,
            subject: "Admin Login Verification - BusyPilot",
            title: "Admin Login Detected 🔐",
            buttonText: "Verify Login",
            description: `Hello ${user.fullname},\n\nA login attempt was made to your admin account. Click the button below to verify and continue to your dashboard.\n\nIf you did not attempt this login, please change your password immediately and contact the security team.`,
            url: `${req.serverUrl}/api/user/verify?token=${adminLoginToken}&type=admin-login`,
          },
          req,
          async (sent) => {
            await Log.create({
              type: "system",
              event: "admin_login_attempt",
              payload: {
                admin: { id: user._id, email: user.email },
                emailSent: sent,
                ip: req.headers["x-forwarded-for"] || req.ip,
                userAgent: req.headers["user-agent"],
              },
            });

            res.status(200).json({
              success: true,
              message: sent
                ? "Admin login verification email sent. Please check your email to verify your login."
                : "Failed to send verification email. Please try again.",
              redirect: sent
                ? `/message?token=${createMessageToken({ title: "Verify Admin Login", description: `A verification email has been sent to ${user.email}. Please click the link in the email to complete your login.`, type: "info" })}`
                : false,
            });
          },
        );

        
        return;
      }

      // Regular user flow
      if (!user.emailVerified) {
        req.token = token;
        sendMail({ email: user.email, token }, req, (sent) => {
          res.status(200).json({
            success: true,
            message: sent
              ? "Login successful! Please check your email to verify your account."
              : "Login successful but verification email failed to send.",
            redirect: sent
              ? `/message?token=${createMessageToken({ title: "Verify Your Email", description: "Please check your email (including spam folder) to verify your account", type: "info" })}`
              : false,
          });
        });
      } else {
        setCookie(res, "token", token, parseInt(LOGIN_EXPIRE));
        res.status(200).json({
          success: true,
          redirect: `/${user.role}/dashboard`,
          user: userData,
        });
      }
    } catch (er) {
      req.message = "Login failed. Please try again.";
      req.err = er;
      next();
    }
  },

  // Get user profile with stores and bots
  async getProfile(req, res, next) {
    try {
      const { user } = req;

      // Get user's stores
      const stores = await Store.find({ owner: user._id }).select("-__v");

      // Get bots for each store
      const storesWithBots = await Promise.all(
        stores.map(async (store) => {
          const bot = await Bot.findOne({ store: store._id }).select(
            "-__v -provider.accessToken -provider.webhookSecret",
          );
          return {
            ...store.toObject(),
            bot: bot || null,
          };
        }),
      );

      const userData = {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        active: user.active,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        stores: storesWithBots,
        config: user.config,
        image: user.image
      };

      res.status(200).json({ success: true, data: userData });
    } catch (er) {
      req.err = er;
      next();
    }
  },

  async getUserDashboard(req, res, next) {
    try {
      const { user } = req;

      // Get user's store
      const store = await Store.findOne({ owner: user._id });

      if (!store) {
        return res.status(200).json({
          success: true,
          data: {
            hasStore: false,
            stats: {},
            recentOrders: [],
            recentNotifications: [],
          },
        });
      }

      // Run all independent queries in parallel
      const [totalOrders, pendingOrders, bot, recentOrders, recentNotifications] = await Promise.all([
        Order.countDocuments({ store: store._id }),
        Order.countDocuments({ store: store._id, status: "pending" }),
        Bot.findOne({ store: store._id }),
        Order.find({ store: store._id })
          .sort({ createdAt: -1 })
          .limit(5)
          .select("orderNumber totalAmount status createdAt products"),
        Notification.find({ userId: user._id })
          .sort({ createdAt: -1 })
          .limit(5)
          .select("title message type isRead createdAt"),
      ]);

      const botMessages = bot?.stats?.totalMessages || 0;
      const botStatus = bot?.status || "inactive";

      res.status(200).json({
        success: true,
        data: {
          hasStore: true,
          store: {
            id: store._id,
            name: store.storeName,
            active: store.active,
            logo: store.logo,
          },
          stats: {
            totalOrders,
            pendingOrders,
            botMessages,
            botStatus,
          },
          recentOrders,
          recentNotifications,
          user: {
            fullname: user.fullname,
            email: user.email,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      req.err = error;
      next();
    }
  },

  // Get user info (light version)
  async getUserInfo(req, res, next) {
    try {
      const { user } = req;
      const storeCount = await Store.countDocuments({
        owner: user._id,
        active: true,
      });

      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified,
          storeCount,
        },
      });
    } catch (er) {
      req.err = er;
      req.message = "Something went wrong!";
      next();
    }
  },

  // Logout user
  async logout(req, res, next) {
    try {
      deleteCookie(res, "token");
      res.status(200).json({
        success: true,
        message: "You have been logged out successfully!",
      });
    } catch (er) {
      req.message = "Something went wrong. Please try again.";
      next();
    }
  },

  // controllers/userController.js - Update resetPassword method
  async resetPassword(req, res, next) {
    try {
      const { type = "email" } = req.params;
      const validation = validatePasswordReset(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message:  validation.errors[0].message,
        });
      }

      const { email, newPassword, state, phone } = validation.data;
      let query = {};

      if (type === "email") {
        query.email = email;
      } else if (type === "info") {
        query = { state, phone };
      }

      const user = await User.findOne(query);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "No user found with the provided information",
        });
      }

      const token = await createToken({
        email: user.email,
        _id: user._id,
        newPassword,
      });
      sendMail(
        {
          email: user.email,
          subject: "Reset Your BusyPilot Password",
          title: "Password Reset Request",
          buttonText: "Reset Password",
          description: `Click the button below to reset your password. This link will expire in 24 hours.`,
          url: `${req.serverUrl}/api/user/verify?token=${token}&type=reset`,
        },
        req,
        (sent) => {
          res.status(sent ? 200 : 500).json({
            success: sent,
            message: sent
              ? "Password reset link sent to your email!"
              : "Failed to send reset email. Please try again.",
            redirect: sent
              ? `/message?token=${createMessageToken({ title: "Check Your Email", description: `We've sent a password reset link to ${user.email}. Please check your inbox and spam folder.`, type: "info" })}`
              : false,
          });
        },
      );
    } catch (er) {
      req.err = er;
      next();
    }
  },

  // Update user settings
  async updateSettings(req, res, next) {
    try {
      const validation = validateUpdateSettings(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message:  validation.errors[0].message,
        });
      }

      const { fullname, phone, password } = validation.data;

      // Verify current password
      const user = await User.findById(req.user._id).select("+password");
      const isCorrect = await compareHashes(password, user.password);
      if (!isCorrect) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password. Please try again.",
        });
      }

      // Prepare updates
      const updates = {};
      if (fullname) updates.fullname = fullname;
      if (phone) updates.phone = phone;
      updates.updatedAt = Date.now();

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { returnDocument: 'after' },
      ).select("-password");

      res.status(200).json({
        success: true,
        message: "Settings updated successfully!",
        data: { user: updatedUser },
      });
    } catch (er) {
      req.err = er;
      next();
    }
  },

  async updateProfile(req, res, next) {
    try {
      const validation = validateUpdateSettings(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message:  validation.errors[0].message,
        });
      }

      const { fullname, phone, image } = validation.data;

      const updates = {};
      if (fullname) updates.fullname = fullname;
      if (phone) updates.phone = phone;
      if (image) updates.image = image;
      updates.updatedAt = Date.now();

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { returnDocument: 'after' },
      ).select("-password");

      res.status(200).json({
        success: true,
        message: "Profile updated successfully!",
        data: { user: updatedUser },
      });
    } catch (er) {
      req.err = er;
      next();
    }
  },

  async updateNotificationSettings(req, res, next) {
    try {
      const { email, sms, inApp } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            "config.notification.email": email !== undefined ? email : true,
            "config.notification.sms": sms !== undefined ? sms : true,
            "config.notification.inApp": inApp !== undefined ? inApp : true,
          },
        },
        { returnDocument: 'after' },
      ).select("-password");

      res.status(200).json({
        success: true,
        message: "Notification settings updated!",
        data: { user: updatedUser },
      });
    } catch (er) {
      req.err = er;
      next();
    }
  },

  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Both old and new password are required",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters",
        });
      }

      const user = await User.findById(req.user._id).select("+password");
      const isCorrect = await compareHashes(oldPassword, user.password);

      if (!isCorrect) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      const hashedPassword = await hash(newPassword);
      await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });

      res.status(200).json({
        success: true,
        message: "Password changed successfully!",
      });
    } catch (er) {
      req.err = er;
      next();
    }
  },

  // Admin authorize
  async adminAuthorize(req, res, next) {
    try {
      const { token } = req.params;
      if (!token || typeof token !== "string") {
        return res.redirect("/login");
      }

      const userData = await getTokenData(token);
      if (!userData) {
        return res.redirect(
          `/message?token=${createMessageToken({ title: "Expired Link", description: "This authorization link has expired. Please login again.", type: "error", redirect: "/login" })}`,
        );
      }

      const { userId, isAdmin = false } = userData;
      setCookie(res, "token", token, true);
      res.redirect(`/${isAdmin ? "admin" : "user"}/dashboard`);
    } catch (er) {
      console.error(er);
      res.redirect("/login");
    }
  },
};
