const asyncHandler = require("../utils/asyncHandler");
const service = require("../services/bannerService");
const { pageKeys } = require("../models/Banner");

exports.list = asyncHandler(async (req, res) => {
  const pageKey = String(req.query.page || "home").trim();
  if (!pageKeys.includes(pageKey)) return res.json({ success: true, data: [] });
  res.json({ success: true, data: await service.listPublished(pageKey) });
});
