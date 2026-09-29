const asyncHandler = require("../utils/asyncHandler");
const service = require("../services/newsService");

exports.categories = asyncHandler(async (req, res) => res.json({ success: true, data: await service.listCategories() }));
exports.list = asyncHandler(async (req, res) => res.json({ success: true, ...(await service.list(req.query)) }));
exports.get = asyncHandler(async (req, res) => res.json({ success: true, data: await service.getPublished(req.params.slug) }));

const categorySlug = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const articleSlug = (value) => categorySlug(value);
const bodyData = (body = {}) => ({
  ...body,
  ...(body.name ? { slug: categorySlug(body.slug || body.name) } : {}),
  ...(body.title ? { slug: articleSlug(body.slug || body.title) } : {}),
});

exports.createCategory = asyncHandler(async (req, res) => res.status(201).json({ success: true, data: await service.createCategory(bodyData(req.body)) }));
exports.updateCategory = asyncHandler(async (req, res) => res.json({ success: true, data: await service.updateCategory(req.params.id, bodyData(req.body)) }));
exports.deleteCategory = asyncHandler(async (req, res) => res.json({ success: true, data: await service.deleteCategory(req.params.id) }));
exports.createArticle = asyncHandler(async (req, res) => {
  const data = bodyData({ ...req.body, author: req.user._id });
  if (data.status === "published" && !data.publishedAt) data.publishedAt = new Date();
  res.status(201).json({ success: true, data: await service.createArticle(data) });
});
exports.updateArticle = asyncHandler(async (req, res) => {
  const data = bodyData(req.body);
  if (data.status === "published" && !data.publishedAt) data.publishedAt = new Date();
  res.json({ success: true, data: await service.updateArticle(req.params.id, data) });
});
exports.deleteArticle = asyncHandler(async (req, res) => res.json({ success: true, data: await service.deleteArticle(req.params.id) }));
