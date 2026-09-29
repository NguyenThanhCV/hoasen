const AppError = require("../utils/AppError");
const escapeRegex = require("../utils/escapeRegex");
exports.make = (Model, { populate = [] } = {}) => ({
  list: async (filter = {}, q = {}) => {
    const page = Math.max(+q.page || 1, 1),
      limit = Math.min(Math.max(+q.limit || 20, 1), 100);
    let query = Model.find(filter);
    if (
      q.search &&
      Model.modelName !== "Cart" &&
      Model.modelName !== "Wishlist"
    )
      query = query.or([
        { name: { $regex: escapeRegex(q.search), $options: "i" } },
        { code: { $regex: escapeRegex(q.search), $options: "i" } },
        { title: { $regex: escapeRegex(q.search), $options: "i" } },
      ]);
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { soldCount: -1, createdAt: -1 },
      rating: { ratingAverage: -1, ratingCount: -1, createdAt: -1 },
      nameAsc: { name: 1 },
      nameDesc: { name: -1 },
    };
    query = query
      .sort(sortOptions[q.sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    for (const p of populate) query = query.populate(p);
    const [data, total] = await Promise.all([
      query,
      Model.countDocuments(filter),
    ]);
    return {
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },
  get: async (id, filter = {}) => {
    let q = Model.findOne({ _id: id, ...filter });
    for (const p of populate) q = q.populate(p);
    const d = await q;
    if (!d) throw new AppError(`Không tìm thấy ${Model.modelName}`, 404);
    return d;
  },
  create: async (data) => Model.create(data),
  update: async (id, data, filter = {}) => {
    let q = Model.findOneAndUpdate({ _id: id, ...filter }, data, {
      new: true,
      runValidators: true,
    });
    for (const p of populate) q = q.populate(p);
    const d = await q;
    if (!d) throw new AppError(`Không tìm thấy ${Model.modelName}`, 404);
    return d;
  },
  remove: async (id, filter = {}) => {
    const d = await Model.findOneAndDelete({ _id: id, ...filter });
    if (!d) throw new AppError(`Không tìm thấy ${Model.modelName}`, 404);
    return d;
  },
});
