const Model = require("../models/Wishlist"),
  AppError = require("../utils/AppError");
exports.get = async (user) => Model.findOne({ user }).populate("products");
exports.create = async (user, products = []) =>
  Model.findOneAndUpdate(
    { user },
    { user, products },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).populate("products");
exports.add = async (user, product) => {
  const w = await Model.findOneAndUpdate(
    { user },
    { $addToSet: { products: product } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return w.populate("products");
};
exports.remove = async (user, product) => {
  const w = await Model.findOneAndUpdate(
    { user },
    { $pull: { products: product } },
    { new: true },
  );
  if (!w) throw new AppError("Wishlist không tồn tại", 404);
  return w.populate("products");
};
exports.clear = async (user) => {
  const w = await Model.findOneAndUpdate(
    { user },
    { $set: { products: [] } },
    { new: true },
  );
  return w?.populate("products");
};
