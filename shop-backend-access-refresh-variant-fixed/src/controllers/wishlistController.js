const s = require("../services/wishlistService"),
  a = require("../utils/asyncHandler");
exports.get = a(async (req, res) =>
  res.json({ success: true, data: await s.get(req.user._id) }),
);
exports.create = a(async (req, res) =>
  res
    .status(201)
    .json({
      success: true,
      data: await s.create(req.user._id, req.body.products || []),
    }),
);
exports.add = a(async (req, res) =>
  res.json({
    success: true,
    data: await s.add(req.user._id, req.body.product),
  }),
);
exports.remove = a(async (req, res) =>
  res.json({
    success: true,
    data: await s.remove(req.user._id, req.params.productId),
  }),
);
exports.clear = a(async (req, res) =>
  res.json({ success: true, data: await s.clear(req.user._id) }),
);
