const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      return next(new AppError("Thiếu access token", 401));
    }

    const token = header.slice(7).trim();
    if (!token) {
      return next(new AppError("Thiếu access token", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "access") {
      return next(new AppError("Token không phải access token", 401));
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User không tồn tại", 401));
    }

    if (user.status !== "active") {
      return next(new AppError("Tài khoản không hoạt động", 403));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Access token đã hết hạn", 401));
    }

    return next(new AppError("Access token không hợp lệ", 401));
  }
};

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Chưa đăng nhập", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("Không đủ quyền", 403));
    }

    next();
  };

module.exports = { protect, restrictTo };
