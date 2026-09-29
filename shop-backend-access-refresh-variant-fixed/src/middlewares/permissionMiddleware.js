const AppError = require("../utils/AppError");
module.exports = (permission) => (req, res, next) => {
  if (req.user?.role === "admin" || req.user?.permissions?.includes(permission))
    return next();
  next(new AppError(`Không có quyền: ${permission}`, 403));
};
