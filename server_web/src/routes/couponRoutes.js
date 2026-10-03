const r = require("express").Router(),
  c = require("../controllers/couponController"),
  { protect } = require("../middlewares/authMiddleware"),
  perm = require("../middlewares/permissionMiddleware"),
  P = require("../constants/permissions");
r.get("/", c.list);
r.use(protect);
r.get("/code/:code", perm(P.COUPON_READ), c.byCode);
r.get("/:id", perm(P.COUPON_READ), c.get);
r.post("/", perm(P.COUPON_CREATE), c.create);
r.patch("/:id", perm(P.COUPON_UPDATE), c.update);
r.delete("/:id", perm(P.COUPON_DELETE), c.remove);
module.exports = r;
