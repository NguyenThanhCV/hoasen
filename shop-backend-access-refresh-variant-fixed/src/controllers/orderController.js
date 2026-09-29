const s = require("../services/orderService"),
  a = require("../utils/asyncHandler");
exports.list = a(async (req, res) =>
  res.json({
    success: true,
    ...(await s.list(
      req.query,
      req.user.role === "admin" ||
        req.user.role === "manager" ||
        req.user.role === "staff"
        ? null
        : req.user._id,
    )),
  }),
);
exports.get = a(async (req, res) => {
  const admin = ["admin", "manager", "staff"].includes(req.user.role);
  res.json({
    success: true,
    data: await s.get(req.params.id, req.user._id, admin),
  });
});
exports.create = a(async (req, res) =>
  res
    .status(201)
    .json({ success: true, data: await s.create(req.user._id, req.body) }),
);
exports.update = a(async (req, res) =>
  res.json({ success: true, data: await s.update(req.params.id, req.body) }),
);
exports.cancel = a(async (req, res) =>
  res.json({
    success: true,
    data: await s.cancel(
      req.params.id,
      req.user._id,
      ["admin", "manager", "staff"].includes(req.user.role),
    ),
  }),
);
exports.remove = a(async (req, res) =>
  res.json({ success: true, data: await s.remove(req.params.id) }),
);
