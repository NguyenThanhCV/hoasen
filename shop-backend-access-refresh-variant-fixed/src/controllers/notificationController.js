const s = require("../services/notificationService"),
  a = require("../utils/asyncHandler");
exports.list = a(async (req, res) =>
  res.json({ success: true, ...(await s.list(req.user._id, req.query)) }),
);
exports.get = a(async (req, res) =>
  res.json({ success: true, data: await s.get(req.params.id, req.user._id) }),
);
exports.create = a(async (req, res) =>
  res.status(201).json({ success: true, data: await s.create(req.body) }),
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
    data: await s.remove(req.params.id, req.user._id),
  }),
);
exports.read = a(async (req, res) =>
  res.json({ success: true, data: await s.read(req.params.id, req.user._id) }),
);
exports.readAll = a(async (req, res) =>
  res.json({ success: true, data: await s.readAll(req.user._id) }),
);
