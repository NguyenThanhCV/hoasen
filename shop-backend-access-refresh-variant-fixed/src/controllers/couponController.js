const s = require("../services/couponService"),
  a = require("../utils/asyncHandler");
exports.list = a(async (req, res) =>
  res.json({ success: true, ...(await s.list({}, req.query)) }),
);
exports.get = a(async (req, res) =>
  res.json({ success: true, data: await s.get(req.params.id) }),
);
exports.byCode = a(async (req, res) =>
  res.json({ success: true, data: await s.byCode(req.params.code) }),
);
exports.create = a(async (req, res) =>
  res.status(201).json({ success: true, data: await s.create(req.body) }),
);
exports.update = a(async (req, res) =>
  res.json({ success: true, data: await s.update(req.params.id, req.body) }),
);
exports.remove = a(async (req, res) =>
  res.json({ success: true, data: await s.remove(req.params.id) }),
);
