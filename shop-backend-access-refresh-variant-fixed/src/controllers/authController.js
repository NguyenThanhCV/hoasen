const authService = require("../services/authService");
const userService = require("../services/userService");
const asyncHandler = require("../utils/asyncHandler");

const getMeta = (req) => ({
  userAgent: req.get("user-agent") || "",
  ip: req.ip || req.socket?.remoteAddress || "",
});

const getRefreshToken = (req) =>
  req.body?.refreshToken ||
  req.cookies?.refreshToken ||
  req.headers["x-refresh-token"];

exports.register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body, getMeta(req));

  res.status(201).json({
    success: true,
    message: "Đăng ký thành công",
    data,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body, getMeta(req));

  res.json({
    success: true,
    message: "Đăng nhập thành công",
    data,
  });
});

exports.refresh = asyncHandler(async (req, res) => {
  const data = await authService.refresh(getRefreshToken(req), getMeta(req));

  res.json({
    success: true,
    message: "Refresh token thành công",
    data,
  });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user.safe(),
  });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateMe(req.user._id, req.body);

  res.json({
    success: true,
    message: "Cập nhật thông tin thành công",
    data: user,
  });
});

exports.changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword,
  );

  res.json({
    success: true,
    message: "Đổi mật khẩu thành công. Tất cả phiên đăng nhập đã bị đăng xuất.",
  });
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(getRefreshToken(req));

  res.json({
    success: true,
    message: "Đăng xuất thành công",
  });
});

exports.logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user._id);

  res.json({
    success: true,
    message: "Đã đăng xuất khỏi tất cả thiết bị",
  });
});

exports.createAdmin = asyncHandler(async (req, res) => {
  const admin = await authService.createAdmin(req.body);

  res.status(201).json({
    success: true,
    message: "Tạo tài khoản admin thành công",
    data: admin,
  });
});
