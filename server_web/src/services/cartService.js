const Cart = require("../models/Cart"),
  Variant = require("../models/ProductVariant"),
  Product = require("../models/Product"),
  AppError = require("../utils/AppError");
const get = (user) =>
  Cart.findOne({ user }).populate("items.product").populate("items.variant");
exports.get = async (user) => get(user);
exports.add = async (user, { product, variant, quantity }) => {
  quantity = Number(quantity);
  if (!Number.isInteger(quantity) || quantity < 1)
    throw new AppError("Quantity không hợp lệ", 400);
  const [p, v] = await Promise.all([
    Product.findById(product),
    Variant.findById(variant),
  ]);
  if (!p || !v || String(v.product) !== String(p._id))
    throw new AppError("Product/variant không hợp lệ", 400);
  if (p.status !== "active" || !v.active)
    throw new AppError("Sản phẩm không hoạt động", 400);
  const cart = (await Cart.findOne({ user })) || new Cart({ user, items: [] });
  const item = cart.items.find((x) => String(x.variant) === String(v._id));
  const newQty = (item?.quantity || 0) + quantity;
  if (v.stock - v.reservedStock < newQty)
    throw new AppError("Không đủ tồn kho", 400);
  if (item) {
    item.quantity = newQty;
    item.price = v.price;
    item.attributes = v.attributes;
  } else
    cart.items.push({
      product: p._id,
      variant: v._id,
      quantity,
      price: v.price,
      attributes: v.attributes,
    });
  await cart.save();
  return get(user);
};
exports.updateItem = async (user, itemId, quantity) => {
  if (!Number.isInteger(quantity) || quantity < 1)
    throw new AppError("Quantity không hợp lệ", 400);
  const cart = await Cart.findOne({ user });
  if (!cart) throw new AppError("Cart không tồn tại", 404);
  const item = cart.items.id(itemId);
  if (!item) throw new AppError("Cart item không tồn tại", 404);
  const v = await Variant.findById(item.variant);
  if (!v || !v.active || v.stock - v.reservedStock < quantity)
    throw new AppError("Không đủ tồn kho", 400);
  const product = await Product.findById(item.product);
  if (!product || product.status !== "active")
    throw new AppError("Sản phẩm không còn được bán", 400);
  item.quantity = quantity;
  item.price = v.price;
  await cart.save();
  return get(user);
};
exports.removeItem = async (user, itemId) => {
  const cart = await Cart.findOne({ user });
  if (!cart) throw new AppError("Cart không tồn tại", 404);
  cart.items = cart.items.filter((x) => String(x._id) !== String(itemId));
  await cart.save();
  return get(user);
};
exports.clear = async (user) => {
  const cart = await Cart.findOne({ user });
  if (!cart) return null;
  cart.items = [];
  await cart.save();
  return get(user);
};
exports.remove = async (user) => {
  const cart = await Cart.findOneAndDelete({ user });
  if (!cart) throw new AppError("Cart không tồn tại", 404);
  return cart;
};
