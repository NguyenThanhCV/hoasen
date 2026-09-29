const Model = require("../models/ProductVariant"),
  Product = require("../models/Product"),
  AppError = require("../utils/AppError"),
  crud = require("./crudService").make(Model, {
    populate: [{ path: "product" }],
  });

const normalizeAttributes = (attributes = {}) => {
  const entries = attributes instanceof Map ? [...attributes.entries()] : Object.entries(attributes || {});
  return Object.fromEntries(
    entries
      .map(([k, v]) => [String(k).trim(), String(v).trim()])
      .filter(([k, v]) => k && v),
  );
};

const signature = (attributes = {}) =>
  JSON.stringify(
    [...(attributes instanceof Map ? attributes.entries() : Object.entries(attributes || {}))]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, String(v).trim().toLowerCase()]),
  );

const validateAndPrepare = async (data = {}, existing = null) => {
  const productId = data.product || existing?.product;
  if (!productId) throw new AppError("Variant phải thuộc một Product.", 400);

  const product = await Product.findById(productId).select("_id");
  if (!product) throw new AppError("Không tìm thấy Product của Variant.", 404);

  const merged = { ...(existing?.toObject?.() || existing || {}), ...data, product: productId };
  delete merged._id;
  delete merged.id;
  delete merged.createdAt;
  delete merged.updatedAt;

  if (
    merged.price === undefined ||
    merged.price === null ||
    Number.isNaN(Number(merged.price)) ||
    Number(merged.price) < 0
  ) {
    throw new AppError("Giá bán Variant là bắt buộc và phải >= 0.", 400);
  }
  if (Number(merged.reservedStock || 0) > Number(merged.stock || 0)) {
    throw new AppError("Tồn giữ không được lớn hơn tồn kho.", 400);
  }

  merged.attributes = normalizeAttributes(merged.attributes);

  const siblings = await Model.find({
    product: productId,
    ...(existing?._id ? { _id: { $ne: existing._id } } : {}),
  }).select("attributes");

  if (siblings.some((v) => signature(v.attributes || {}) === signature(merged.attributes))) {
    throw new AppError("Variant có cùng tổ hợp thuộc tính đã tồn tại.", 409);
  }

  return merged;
};

exports.list = async (q = {}) => {
  const filter = {};
  if (q.product) filter.product = q.product;
  if (q.active !== undefined)
    filter.active = q.active === true || q.active === "true";
  return crud.list(filter, q);
};
exports.get = crud.get;

exports.create = async (data) => {
  const payload = await validateAndPrepare(data);
  return crud.create(payload);
};

exports.update = async (id, data) => {
  const existing = await Model.findById(id);
  if (!existing) throw new AppError("Không tìm thấy ProductVariant", 404);
  const payload = await validateAndPrepare(data, existing);
  return crud.update(id, payload);
};

exports.remove = async (id) => {
  const variant = await Model.findById(id);
  if (!variant) throw new AppError("Không tìm thấy ProductVariant", 404);

  const count = await Model.countDocuments({ product: variant.product });
  if (count <= 1) {
    throw new AppError(
      "Không thể xóa Variant cuối cùng. Product phải có ít nhất 1 Variant.",
      400,
    );
  }
  return crud.remove(id);
};
