const NewsArticle = require("../models/NewsArticle");
const NewsCategory = require("../models/NewsCategory");
const AppError = require("../utils/AppError");
const escapeRegex = require("../utils/escapeRegex");

exports.listCategories = async () => NewsCategory.find({ status: "active" }).sort({ sortOrder: 1, name: 1 });

exports.list = async (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 50);
  const filter = { status: "published", publishedAt: { $lte: new Date() } };
  if (query.category) {
    const categoryQuery = /^[a-f\d]{24}$/i.test(String(query.category))
      ? { $or: [{ _id: query.category }, { slug: query.category }] }
      : { slug: query.category };
    const category = await NewsCategory.findOne({ ...categoryQuery, status: "active" }).select("_id");
    if (!category) return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    filter.category = category._id;
  }
  if (query.search) {
    const search = { $regex: escapeRegex(String(query.search).slice(0, 80)), $options: "i" };
    filter.$or = [{ title: search }, { excerpt: search }, { tags: search }];
  }
  const [data, total] = await Promise.all([
    NewsArticle.find(filter).populate("category", "name slug").populate("author", "name")
      .sort({ publishedAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
    NewsArticle.countDocuments(filter),
  ]);
  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

exports.getPublished = async (slug) => {
  const article = await NewsArticle.findOne({ slug, status: "published", publishedAt: { $lte: new Date() } })
    .populate("category", "name slug").populate("author", "name");
  if (!article) throw new AppError("Không tìm thấy bài viết", 404);
  await NewsArticle.updateOne({ _id: article._id }, { $inc: { views: 1 } });
  return article;
};

exports.createCategory = (data) => NewsCategory.create(data);
exports.updateCategory = async (id, data) => {
  const category = await NewsCategory.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!category) throw new AppError("Không tìm thấy danh mục tin tức", 404);
  return category;
};
exports.deleteCategory = async (id) => {
  if (await NewsArticle.exists({ category: id })) throw new AppError("Danh mục đang có bài viết, hãy chuyển bài viết trước khi xóa", 409);
  const category = await NewsCategory.findByIdAndDelete(id);
  if (!category) throw new AppError("Không tìm thấy danh mục tin tức", 404);
  return category;
};
exports.createArticle = (data) => NewsArticle.create(data);
exports.updateArticle = async (id, data) => {
  const article = await NewsArticle.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate("category", "name slug").populate("author", "name");
  if (!article) throw new AppError("Không tìm thấy bài viết", 404);
  return article;
};
exports.deleteArticle = async (id) => {
  const article = await NewsArticle.findByIdAndDelete(id);
  if (!article) throw new AppError("Không tìm thấy bài viết", 404);
  return article;
};
