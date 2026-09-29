const Model = require("../models/Review"),
  Product = require("../models/Product"),
  Order = require("../models/Order"),
  OrderItem = require("../models/OrderItem"),
  AppError = require("../utils/AppError");
exports.list = async (product, q = {}) => {
  const page = Math.max(+q.page || 1, 1),
    limit = Math.min(Math.max(+q.limit || 20, 1), 100),
    filter = { product };
  // Storefront visitors may only see reviews approved by an administrator.
  filter.status = "approved";
  const [data, total] = await Promise.all([
    Model.find(filter)
      .populate("user", "name avatar")
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
exports.get = async (id, user, admin = false) => {
  const d = await Model.findById(id)
    .populate("product")
    .populate("user", "name avatar");
  if (!d) throw new AppError("Review không tồn tại", 404);
  if (!admin && String(d.user._id) !== String(user))
    throw new AppError("Không có quyền", 403);
  return d;
};
exports.create = async (user, d) => {
  if (!(await Product.exists({ _id: d.product, status: "active" })))
    throw new AppError("Product không tồn tại", 404);
  const payload = {
    product: d.product,
    user,
    rating: d.rating,
    title: d.title,
    content: d.content,
    images: d.images,
    videos: d.videos,
    status: "pending",
    verifiedPurchase: false,
  };
  if (d.order) {
    const completedOrder = await Order.exists({
      _id: d.order,
      user,
      orderStatus: "completed",
    });
    const purchasedProduct = completedOrder &&
      await OrderItem.exists({ order: d.order, product: d.product });
    if (!purchasedProduct)
      throw new AppError("Đơn hàng không có sản phẩm này hoặc chưa hoàn tất", 400);
    payload.order = d.order;
    payload.verifiedPurchase = true;
  }
  return Model.create(payload);
};
exports.update = async (id, user, d) => {
  const r = await exports.get(id, user, false);
  for (const k of ["rating", "title", "content", "images", "videos"])
    if (d[k] !== undefined) r[k] = d[k];
  r.status = "pending";
  await r.save();
  return r;
};
exports.remove = async (id, user, admin = false) => {
  const r = await exports.get(id, user, admin);
  await r.deleteOne();
  return r;
};
exports.moderate = async (id, status) => {
  const r = await Model.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  );
  if (!r) throw new AppError("Review không tồn tại", 404);
  return r;
};
