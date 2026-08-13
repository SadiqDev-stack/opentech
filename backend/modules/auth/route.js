// routers/user.js
import { Router } from "express";
import { userController } from "../controllers/userController.js";
import authenticate from "../middlewares/authentication.js";
import authorize from "../middlewares/authorization.js";
import user from "../models/user.js";
import { useLimiter } from "../utilities/general.js";

const router = Router();

// Rate limiters
const authLimiter = useLimiter("15m", 5); // Strict for auth endpoints
const publicLimiter = useLimiter("1m", 100); // Public endpoints
const generalLimiter = useLimiter("1m", 50); // General authenticated endpoints

// Public routes with rate limiting
router.post("/register", authLimiter, userController.register);
router.get("/verify", publicLimiter, userController.verify);
router.post("/authenticate", authLimiter, authenticate, userController.authenticate);
router.post("/reset/:type", authLimiter, userController.resetPassword);
router.post("/logout", userController.logout);
router.get("/admin/authorize/:token", publicLimiter, userController.adminAuthorize);

// Protected routes (require authorization) with rate limiting
router.use(generalLimiter);
router.get("/profile", authorize, userController.getProfile);
router.get("/info", authorize, userController.getUserInfo);
router.put("/setting", authorize, userController.updateSettings);
router.get("/dashboard", authorize, userController.getUserDashboard);
router.put("/profile", authorize, userController.updateProfile);
router.put("/notification-settings", authorize, userController.updateNotificationSettings);
router.put("/change-password", authorize, userController.changePassword);

export default router;