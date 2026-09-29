module.exports = (err, req, res, next) => {
  let status = err.statusCode || 500;
  if (err.name === "ValidationError") status = 400;
  if (err.code === 11000) status = 409;
  res
    .status(status)
    .json({
      success: false,
      message:
        err.code === 11000
          ? `Dữ liệu đã tồn tại: ${Object.keys(err.keyValue || {}).join(",")}`
          : err.message || "Server error",
      ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
    });
};
