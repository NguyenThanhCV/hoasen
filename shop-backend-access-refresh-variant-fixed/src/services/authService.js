const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const RP = require("../constants/rolePermissions");
const rolePermissions = require("../constants/rolePermissions");
const AppError = require("../utils/AppError");
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} = require("../utils/generateToken");

const REFRESH_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 30);

const refreshExpiresAt = () =>
  new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

const createSession = async (user, meta = {}) => {
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);

  await RefreshToken.create({
    user: user._id,
    tokenHash,
    expiresAt: refreshExpiresAt(),
    userAgent: meta.userAgent || "",
    ip: meta.ip || "",
  });

  return {
    accessToken: generateAccessToken(user),
    refreshToken,
  };
};

exports.register = async ({ name, email, password, phone }, meta) => {
  const normalizedEmail = email.toLowerCase().trim();

  if (await User.exists({ email: normalizedEmail })) {
    throw new AppError("Email đã tồn tại", 409);
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    phone,
    role: "customer",
    permissions: RP.customer,
  });

  const tokens = await createSession(user, meta);

  return {
    user: user.safe(),
    ...tokens,
  };
};

exports.login = async ({ email, password }, meta) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Email hoặc mật khẩu không đúng", 401);
  }

  if (user.status !== "active") {
    throw new AppError("Tài khoản không hoạt động", 403);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await createSession(user, meta);

  return {
    user: user.safe(),
    ...tokens,
  };
};

exports.refresh = async (rawRefreshToken, meta) => {
  if (!rawRefreshToken) {
    throw new AppError("Thiếu refresh token", 401);
  }

  const tokenHash = hashToken(rawRefreshToken);
  const session = await RefreshToken.findOne({ tokenHash });

  if (!session) {
    throw new AppError("Refresh token không hợp lệ", 401);
  }

  if (session.revokedAt) {
    // Reuse detection: revoke all sessions if an already-rotated token is used.
    await RefreshToken.updateMany(
      { user: session.user, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
    throw new AppError("Refresh token đã bị thu hồi", 401);
  }

  if (session.expiresAt <= new Date()) {
    throw new AppError("Refresh token đã hết hạn", 401);
  }

  const user = await User.findById(session.user);

  if (!user) {
    session.revokedAt = new Date();
    await session.save();
    throw new AppError("User không tồn tại", 401);
  }

  if (user.status !== "active") {
    session.revokedAt = new Date();
    await session.save();
    throw new AppError("Tài khoản không hoạt động", 403);
  }

  // Rotate refresh token: old token becomes unusable immediately.
  const newRefreshToken = generateRefreshToken();
  const newTokenHash = hashToken(newRefreshToken);

  session.revokedAt = new Date();
  session.replacedByTokenHash = newTokenHash;
  await session.save();

  await RefreshToken.create({
    user: user._id,
    tokenHash: newTokenHash,
    expiresAt: refreshExpiresAt(),
    userAgent: meta.userAgent || session.userAgent || "",
    ip: meta.ip || session.ip || "",
  });

  return {
    accessToken: generateAccessToken(user),
    refreshToken: newRefreshToken,
  };
};

exports.logout = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;

  const tokenHash = hashToken(rawRefreshToken);
  await RefreshToken.findOneAndUpdate(
    { tokenHash, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
};

exports.logoutAll = async (userId) => {
  await RefreshToken.updateMany(
    { user: userId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
};

exports.me = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError("User không tồn tại", 404);
  return user.safe();
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");

  if (!user) throw new AppError("User không tồn tại", 404);

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError("Mật khẩu hiện tại không đúng", 400);
  }

  user.password = newPassword;
  await user.save();

  // Force every device/session to authenticate again after password change.
  await exports.logoutAll(userId);
};

exports.createAdmin = async ({ setupKey, name, email, password, phone }) => {
  if (!process.env.ADMIN_SETUP_KEY) {
    throw new Error("ADMIN_SETUP_KEY chưa được cấu hình");
  }

  if (setupKey !== process.env.ADMIN_SETUP_KEY) {
    const error = new Error("Admin setup key không hợp lệ");
    error.statusCode = 403;
    throw error;
  }

  if (!name || !email || !password) {
    const error = new Error("name, email và password là bắt buộc");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    const error = new Error("Email đã tồn tại");
    error.statusCode = 409;
    throw error;
  }

  const admin = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone,
    role: "admin",
    permissions: rolePermissions.admin,
    status: "active",
  });

  return admin.safe();
};
