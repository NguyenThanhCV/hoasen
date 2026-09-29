const s = require("../services/reviewService"),
  a = require("../utils/asyncHandler");
exports.list = a(async (req, res) =>
  res.json({
    success: true,
    ...(await s.list(req.params.productId, req.query)),
  }),
);
exports.get = a(async (req, res) =>
  res.json({
    success: true,
    data: await s.get(
      req.params.id,
      req.user._id,
      ["admin", "manager", "staff"].includes(req.user.role),
    ),
  }),
);
exports.create = a(async (req, res) =>
  res
    .status(201)
    .json({ success: true, data: await s.create(req.user._id, req.body) }),
);
exports.update = a(async (req, res) =>
  res.json({
    success: true,
    data: await s.update(req.params.id, req.user._id, req.body),
  }),
);
exports.remove = a(async (req, res) =>
  res.json({
    success: true,
    data: await s.remove(
      req.params.id,
      req.user._id,
      ["admin", "manager", "staff"].includes(req.user.role),
    ),
  }),
);
exports.moderate = a(async (req, res) =>
  res.json({
    success: true,
    data: await s.moderate(req.params.id, req.body.status),
  }),
);
