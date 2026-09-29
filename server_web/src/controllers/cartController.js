const s = require("../services/cartService"),
  a = require("../utils/asyncHandler");
exports.get = a(async (req, res) =>
  res.json({ success: true, data: await s.get(req.user._id) }),
);
exports.remove = a(async (req, res) =>
  res.json({ success: true, data: await s.remove(req.user._id) }),
);
exports.add = a(async (req, res) =>
  res
    .status(201)
    .json({ success: true, data: await s.add(req.user._id, req.body) }),
);
exports.updateItem = a(async (req, res) =>
  res.json({
    success: true,
    data: await s.updateItem(
      req.user._id,
      req.params.itemId,
      Number(req.body.quantity),
    ),
  }),
);
exports.removeItem = a(async (req, res) =>
  res.json({
    success: true,
    data: await s.removeItem(req.user._id, req.params.itemId),
  }),
);
exports.clear = a(async (req, res) =>
  res.json({ success: true, data: await s.clear(req.user._id) }),
);
