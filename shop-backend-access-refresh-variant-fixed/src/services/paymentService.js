const Model = require("../models/Payment"),
  Order = require("../models/Order"),
  AppError = require("../utils/AppError"),
  crud = require("./crudService").make(Model, { populate: ["order", "user"] });
exports.list = async (q) => crud.list({}, q);
exports.get = crud.get;
exports.create = async (user, d) => {
  const order = await Order.findOne({ _id: d.order, user });
  if (!order)
    throw new AppError("Order không tồn tại hoặc không thuộc user", 404);
  if (Number(d.amount) !== Number(order.total))
    throw new AppError("Số tiền thanh toán không khớp đơn hàng", 400);
  const exists = await Model.findOne({ order: order._id });
  if (exists) throw new AppError("Order đã có payment", 409);
  return Model.create({
    order: order._id,
    user,
    method: order.paymentMethod,
    amount: order.total,
    currency: d.currency || "VND",
    provider: d.provider,
    status: "pending",
    metadata: d.metadata || {},
  });
};
exports.update = crud.update;
exports.remove = crud.remove;
