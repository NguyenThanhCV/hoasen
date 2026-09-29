const Model = require("../models/Notification"),
  AppError = require("../utils/AppError");
exports.list = async (user, q = {}) => {
  const page = Math.max(+q.page || 1, 1),
    limit = Math.min(Math.max(+q.limit || 20, 1), 100),
    filter = { user };
  if (q.isRead !== undefined)
    filter.isRead = q.isRead === "true" || q.isRead === true;
  const [data, total] = await Promise.all([
    Model.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Model.countDocuments(filter),
  ]);
  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};
exports.get = async (id, user) => {
  const d = await Model.findOne({ _id: id, user });
  if (!d) throw new AppError("Không tìm thấy thông báo", 404);
  return d;
};
exports.create = async (d) => Model.create(d);
exports.update = async (id, user, d) => {
  const n = await exports.get(id, user);
  Object.assign(n, d);
  await n.save();
  return n;
};
exports.remove = async (id, user) => {
  const n = await exports.get(id, user);
  await n.deleteOne();
  return n;
};
exports.read = async (id, user) => {
  const n = await exports.get(id, user);
  n.isRead = true;
  n.readAt = new Date();
  await n.save();
  return n;
};
exports.readAll = async (user) =>
  Model.updateMany(
    { user, isRead: false },
    { $set: { isRead: true, readAt: new Date() } },
  );
