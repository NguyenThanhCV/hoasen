module.exports = (req, res, next) =>
  next(
    new (require("../utils/AppError"))(
      `Không tìm thấy: ${req.method} ${req.originalUrl}`,
      404,
    ),
  );
