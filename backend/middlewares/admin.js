// middlewares/admin.js
export const adminMiddleware = (req, res, next) => {

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin" && req.user.role !== "super") {
    return res.status(403).json({
      success: false,
      message: "Admin access required. You don't have permission to perform this action.",
    });
  }


  next();
};

// Super admin only middleware
export const superAdminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "super") {
    return res.status(403).json({
      success: false,
      message: "Super admin access required",
    });
  }

  next();
};