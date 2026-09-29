const Order = require("../models/Order"),
  OrderItem = require("../models/OrderItem"),
  Cart = require("../models/Cart"),
  Variant = require("../models/ProductVariant"),
  Product = require("../models/Product"),
  Address = require("../models/Address"),
  Coupon = require("../models/Coupon"),
  CouponRedemption = require("../models/CouponRedemption"),
  AppError = require("../utils/AppError");
const num = (x) => Math.max(Number(x) || 0, 0);
const orderNo = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
exports.list = async (q = {}, user = null) => {
  const page = Math.max(+q.page || 1, 1),
    limit = Math.min(Math.max(+q.limit || 20, 1), 100),
    filter = user ? { user } : {};
  if (q.orderStatus) filter.orderStatus = q.orderStatus;
  if (q.paymentStatus) filter.paymentStatus = q.paymentStatus;
  const [data, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email phone")
      .populate("coupon")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);
  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};
exports.get = async (id, user, admin = false) => {
  const filter = admin ? { _id: id } : { _id: id, user };
  const order = await Order.findOne(filter)
    .populate("user", "name email phone")
    .populate("coupon");
  if (!order) throw new AppError("Không tìm thấy order", 404);
  const items = await OrderItem.find({ order: id })
    .populate("product")
    .populate("variant");
  return { order, items };
};
exports.create = async (
  user,
  { addressId, paymentMethod, note, couponCode },
) => {
  const address = await Address.findOne({ _id: addressId, user });
  if (!address) throw new AppError("Địa chỉ không tồn tại", 404);
  const cart = await Cart.findOne({ user })
    .populate("items.product")
    .populate("items.variant");
  if (!cart || !cart.items.length) throw new AppError("Cart trống", 400);
  let subtotal = 0;
  const lines = [];
  for (const x of cart.items) {
    const v = await Variant.findById(x.variant);
    const p = await Product.findById(x.product);
    if (!v || !p || !v.active || p.status !== "active")
      throw new AppError("Có sản phẩm không còn bán", 400);
    const available = v.stock - v.reservedStock;
    if (available < x.quantity)
      throw new AppError(`Không đủ tồn kho cho ${p.name}`, 400);
    const price = num(v.price),
      total = price * x.quantity;
    subtotal += total;
    lines.push({ product: p, variant: v, quantity: x.quantity, price, total });
  }
  let discount = 0,
    coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({
      code: String(couponCode).toUpperCase(),
      status: "active",
    });
    if (!coupon) throw new AppError("Coupon không hợp lệ", 400);
    const now = new Date();
    if (
      (coupon.startDate && coupon.startDate > now) ||
      (coupon.endDate && coupon.endDate < now)
    )
      throw new AppError("Coupon hết hạn", 400);
    if (subtotal < coupon.minOrderValue)
      throw new AppError("Chưa đạt giá trị tối thiểu của coupon", 400);
    if (
      coupon.usageLimit !== undefined &&
      coupon.usageLimit !== null &&
      coupon.usedCount >= coupon.usageLimit
    )
      throw new AppError("Coupon đã hết lượt sử dụng", 400);
    discount =
      coupon.type === "percentage"
        ? (subtotal * coupon.value) / 100
        : coupon.value;
    if (coupon.maxDiscount != null)
      discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.min(discount, subtotal);
  }
  const order = await Order.create({
    orderNumber: orderNo(),
    user,
    customer: { fullName: address.fullName, phone: address.phone },
    address: address.toObject(),
    subtotal,
    discount,
    total: subtotal - discount,
    coupon: coupon ? coupon._id : null,
    paymentMethod,
    note,
  });
  const adjustedVariants = [];
  let couponUsageRecorded = false;
  let userCouponUsageRecorded = false;
  try {
    for (const l of lines) {
      const changed = await Variant.findOneAndUpdate(
        {
          _id: l.variant._id,
          active: true,
          $expr: {
            $gte: [
              { $subtract: ["$stock", { $ifNull: ["$reservedStock", 0] }] },
              l.quantity,
            ],
          },
        },
        { $inc: { stock: -l.quantity } },
        { new: true },
      );
      if (!changed)
        throw new AppError("Tồn kho vừa thay đổi, vui lòng thử lại", 409);
      adjustedVariants.push({ id: l.variant._id, quantity: l.quantity });
      await OrderItem.create({
        order: order._id,
        product: l.product._id,
        variant: l.variant._id,
        productName: l.product.name,
        variantName:
          l.variant.attributes instanceof Map
            ? Array.from(l.variant.attributes.entries())
                .map((a) => a.join(": "))
                .join(", ")
            : Object.entries(l.variant.attributes || {})
                .map((a) => a.join(": "))
                .join(", "),
        sku: l.variant.sku,
        attributes: l.variant.attributes,
        image: l.variant.thumbnail || l.product.thumbnail,
        price: l.price,
        quantity: l.quantity,
        discount: 0,
        total: l.total,
      });
    }
    if (coupon) {
      const couponFilter = { _id: coupon._id, status: "active" };
      if (coupon.usageLimit != null) {
        couponFilter.$expr = {
          $lt: [{ $ifNull: ["$usedCount", 0] }, coupon.usageLimit],
        };
      }
      const result = await Coupon.updateOne(couponFilter, {
        $inc: { usedCount: 1 },
      });
      if (!result.modifiedCount)
        throw new AppError("Coupon đã hết lượt sử dụng", 409);
      couponUsageRecorded = true;
      if (coupon.usageLimitPerUser > 0) {
        try {
          await CouponRedemption.findOneAndUpdate(
            {
              coupon: coupon._id,
              user,
              count: { $lt: coupon.usageLimitPerUser },
            },
            {
              $inc: { count: 1 },
              $setOnInsert: { coupon: coupon._id, user },
            },
            { upsert: true, new: true, runValidators: true },
          );
          userCouponUsageRecorded = true;
        } catch (error) {
          if (error.code === 11000)
            throw new AppError("Bạn đã sử dụng hết lượt của coupon này", 409);
          throw error;
        }
      }
    }
    await Cart.updateOne({ _id: cart._id }, { $set: { items: [] } });
  } catch (e) {
    await Promise.all(
      adjustedVariants.map(({ id, quantity }) =>
        Variant.updateOne({ _id: id }, { $inc: { stock: quantity } }),
      ),
    );
    if (couponUsageRecorded)
      await Coupon.updateOne(
        { _id: coupon._id, usedCount: { $gt: 0 } },
        { $inc: { usedCount: -1 } },
      );
    if (userCouponUsageRecorded) {
      const redemption = await CouponRedemption.findOneAndUpdate(
        { coupon: coupon._id, user, count: { $gt: 0 } },
        { $inc: { count: -1 } },
        { new: true },
      );
      if (redemption?.count === 0) await redemption.deleteOne();
    }
    await OrderItem.deleteMany({ order: order._id });
    await Order.deleteOne({ _id: order._id });
    throw e;
  }
  return exports.get(order._id, user, false);
};
exports.update = async (id, d) => {
  if (d.orderStatus === "cancelled") {
    return exports.cancel(id, null, true);
  }
  const allowed = ["paymentMethod", "paymentStatus", "orderStatus", "note"];
  const data = {};
  for (const k of allowed) if (d[k] !== undefined) data[k] = d[k];
  if (d.orderStatus === "cancelled") data.cancelledAt = new Date();
  if (d.orderStatus === "completed") data.completedAt = new Date();
  const o = await Order.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!o) throw new AppError("Order không tồn tại", 404);
  return exports.get(id, null, true);
};
exports.cancel = async (id, user, admin = false) => {
  const { order } = await exports.get(id, user, admin);
  if (order.orderStatus === "cancelled")
    throw new AppError("Đơn hàng đã được hủy", 409);
  if (!admin && !["pending", "confirmed"].includes(order.orderStatus))
    throw new AppError("Không thể hủy đơn ở trạng thái hiện tại", 400);
  const priorStatus = order.orderStatus;
  const cancelled = await Order.findOneAndUpdate(
    { _id: order._id, orderStatus: priorStatus },
    { $set: { orderStatus: "cancelled", cancelledAt: new Date() } },
    { new: true },
  );
  if (!cancelled)
    throw new AppError("Đơn hàng vừa được cập nhật, vui lòng thử lại", 409);

  const items = await OrderItem.find({ order: order._id });
  for (const item of items) {
    await Variant.updateOne(
      { _id: item.variant },
      { $inc: { stock: item.quantity } },
    );
  }
  if (order.coupon) {
    await Coupon.updateOne(
      { _id: order.coupon, usedCount: { $gt: 0 } },
      { $inc: { usedCount: -1 } },
    );
    const redemption = await CouponRedemption.findOneAndUpdate(
      { coupon: order.coupon, user: order.user, count: { $gt: 0 } },
      { $inc: { count: -1 } },
      { new: true },
    );
    if (redemption?.count === 0) await redemption.deleteOne();
  }
  return exports.get(id, user, admin);
};
exports.remove = async (id) => {
  const o = await Order.findById(id);
  if (!o) throw new AppError("Order không tồn tại", 404);
  if (!["cancelled", "refunded"].includes(o.orderStatus)) {
    const items = await OrderItem.find({ order: id });
    await Promise.all(
      items.map((item) =>
        Variant.updateOne(
          { _id: item.variant },
          { $inc: { stock: item.quantity } },
        ),
      ),
    );
  }
  if (o.coupon && o.orderStatus !== "cancelled")
    await Coupon.updateOne(
      { _id: o.coupon, usedCount: { $gt: 0 } },
      { $inc: { usedCount: -1 } },
    );
  if (o.coupon && o.orderStatus !== "cancelled") {
    const redemption = await CouponRedemption.findOneAndUpdate(
      { coupon: o.coupon, user: o.user, count: { $gt: 0 } },
      { $inc: { count: -1 } },
      { new: true },
    );
    if (redemption?.count === 0) await redemption.deleteOne();
  }
  await Order.deleteOne({ _id: id });
  await OrderItem.deleteMany({ order: id });
  return o;
};
