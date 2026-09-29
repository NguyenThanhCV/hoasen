const User = require("../models/User"),
  { ALL_ROLES } = require("../constants/roles"),
  RP = require("../constants/rolePermissions"),
  P = require("../constants/permissions"),
  escapeRegex = require("../utils/escapeRegex"),
  AppError = require("../utils/AppError");
const clean = (u) => (u?.safe ? u.safe() : u);
exports.list = async (q = {}) => {
  const page = Math.max(+q.page || 1, 1),
    limit = Math.min(Math.max(+q.limit || 20, 1), 100),
    filter = {};
  if (q.search)
    filter.$or = [
      { name: { $regex: escapeRegex(q.search), $options: "i" } },
      { email: { $regex: escapeRegex(q.search), $options: "i" } },
      { phone: { $regex: escapeRegex(q.search), $options: "i" } },
    ];
  if (q.role) filter.role = q.role;
  if (q.status) filter.status = q.status;
  const [data, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);
  return {
    data: data.map(clean),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};
exports.get = async (id) => {
  const u = await User.findById(id);
  if (!u) throw new AppError("Không tìm thấy user", 404);
  return clean(u);
};
exports.create = async (d) => {
  if (!ALL_ROLES.includes(d.role || "customer"))
    throw new AppError("Role không hợp lệ", 400);
  const u = await User.create({
    ...d,
    permissions: d.permissions || RP[d.role || "customer"],
  });
  return clean(u);
};
exports.update = async (id, d) => {
  const u = await User.findById(id).select("+password");
  if (!u) throw new AppError("Không tìm thấy user", 404);
  for (const k of ["name", "email", "phone", "avatar", "password", "status"])
    if (d[k] !== undefined) u[k] = d[k];
  if (d.email) u.email = d.email.toLowerCase();
  if (d.role !== undefined) {
    if (!ALL_ROLES.includes(d.role))
      throw new AppError("Role không hợp lệ", 400);
    u.role = d.role;
    u.permissions = RP[d.role] || [];
  }
  await u.save();
  return clean(u);
};
exports.status = async (id, status) => exports.update(id, { status });
exports.role = async (id, role) => exports.update(id, { role });
exports.permissions = async (id, permissions) => {
  if (
    !Array.isArray(permissions) ||
    permissions.some((x) => !Object.values(P).includes(x))
  )
    throw new AppError("Danh sách permission không hợp lệ", 400);
  const u = await User.findByIdAndUpdate(
    id,
    { permissions },
    { new: true, runValidators: true },
  );
  if (!u) throw new AppError("Không tìm thấy user", 404);
  return clean(u);
};
exports.remove = async (id) => {
  const r = await User.findByIdAndDelete(id);
  if (!r) throw new AppError("Không tìm thấy user", 404);
  return clean(r);
};
exports.stats = async () =>
  User.aggregate([
    {
      $group: { _id: { role: "$role", status: "$status" }, count: { $sum: 1 } },
    },
  ]);
exports.updateMe = async (id, data = {}) => {
  const user = await User.findById(id);
  if (!user) throw new AppError("Không tìm thấy user", 404);
  for (const key of ["name", "phone", "avatar"])
    if (data[key] !== undefined) user[key] = data[key];
  await user.save();
  return clean(user);
};
