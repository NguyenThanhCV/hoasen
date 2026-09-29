const Address = require("../models/Address"),
  AppError = require("../utils/AppError");
exports.list = async (user) =>
  Address.find({ user }).sort({ isDefault: -1, createdAt: -1 });
exports.get = async (id, user) => {
  const d = await Address.findOne({ _id: id, user });
  if (!d) throw new AppError("Không tìm thấy địa chỉ", 404);
  return d;
};
exports.create = async (user, data) => {
  if (data.isDefault) await Address.updateMany({ user }, { isDefault: false });
  return Address.create({ ...data, user });
};
exports.update = async (id, user, data) => {
  const d = await exports.get(id, user);
  if (data.isDefault)
    await Address.updateMany({ user, _id: { $ne: id } }, { isDefault: false });
  Object.assign(d, data);
  d.user = user;
  await d.save();
  return d;
};
exports.remove = async (id, user) => {
  const d = await exports.get(id, user);
  await d.deleteOne();
  return d;
};
