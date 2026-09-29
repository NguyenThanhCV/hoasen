const r = require("express").Router(),
  c = require("../controllers/paymentController"),
  { protect } = require("../middlewares/authMiddleware"),
  perm = require("../middlewares/permissionMiddleware"),
  P = require("../constants/permissions"),
  AppError = require("../utils/AppError");
r.use(protect);
r.get("/", c.list);
r.get("/:id", c.get);
r.post("/", perm(P.PAYMENT_CREATE), c.create);
const requireStaff = (req, res, next) =>
  ["admin", "manager", "staff"].includes(req.user.role)
    ? next()
    : next(new AppError("Không đủ quyền", 403));
r.patch("/:id", requireStaff, perm(P.PAYMENT_UPDATE), c.update);
r.delete("/:id", requireStaff, perm(P.PAYMENT_DELETE), c.remove);
module.exports = r;
