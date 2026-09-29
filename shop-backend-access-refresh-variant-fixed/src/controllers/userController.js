const s = require("../services/userService"),
  asyncHandler = require("../utils/asyncHandler");
exports.list = asyncHandler(async (req, res) =>
  res.json({ success: true, ...(await s.list(req.query)) }),
);
exports.get = asyncHandler(async (req, res) =>
  res.json({ success: true, data: await s.get(req.params.id) }),
);
exports.create = asyncHandler(async (req, res) =>
  res.status(201).json({ success: true, data: await s.create(req.body) }),
);
exports.update = asyncHandler(async (req, res) =>
  res.json({ success: true, data: await s.update(req.params.id, req.body) }),
);
exports.status = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: await s.status(req.params.id, req.body.status),
  }),
);
exports.role = asyncHandler(async (req, res) =>
  res.json({ success: true, data: await s.role(req.params.id, req.body.role) }),
);
exports.permissions = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: await s.permissions(req.params.id, req.body.permissions),
  }),
);
exports.remove = asyncHandler(async (req, res) =>
  res.json({ success: true, data: await s.remove(req.params.id) }),
);
exports.stats = asyncHandler(async (req, res) =>
  res.json({ success: true, data: await s.stats() }),
);
