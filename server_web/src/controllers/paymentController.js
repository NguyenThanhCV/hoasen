const s = require("../services/paymentService"),
  a = require("../utils/asyncHandler");
exports.list = a(async (req, res) =>
  res.json({
    success: true,
    ...(await s.list(
      req.query,
      ["admin", "manager", "staff"].includes(req.user.role)
        ? null
        : req.user._id,
    )),
  }),
);
exports.get = a(async (req, res) =>
  res.json({
    success: true,
    data: await s.get(
      req.params.id,
      ["admin", "manager", "staff"].includes(req.user.role)
        ? null
        : req.user._id,
    ),
  }),
);
exports.create = a(async (req, res) =>
  res
    .status(201)
    .json({ success: true, data: await s.create(req.user._id, req.body) }),
);
exports.update = a(async (req, res) =>
  res.json({ success: true, data: await s.update(req.params.id, req.body) }),
);
exports.remove = a(async (req, res) =>
  res.json({ success: true, data: await s.remove(req.params.id) }),
);
