const Model = require("../models/Coupon"),
  crud = require("./crudService").make(Model, {
    populate: [
      "applicableProducts",
      "applicableCategories",
      "excludedProducts",
    ],
  }),
  AppError = require("../utils/AppError");
exports.list = crud.list;
exports.get = crud.get;
exports.create = async (d) => crud.create({ ...d, code: d.code.toUpperCase() });
exports.update = async (id, d) =>
  crud.update(id, { ...d, ...(d.code ? { code: d.code.toUpperCase() } : {}) });
exports.remove = crud.remove;
exports.byCode = async (code) => {
  const now = new Date(),
    d = await Model.findOne({
      code: code.toUpperCase(),
      status: "active",
      $and: [
        { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
      ],
    });
  if (!d) throw new AppError("Coupon không hợp lệ hoặc đã hết hạn", 404);
  return d;
};
