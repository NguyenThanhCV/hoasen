const r = require("express").Router(),
  c = require("../controllers/paymentController"),
  { protect } = require("../middlewares/authMiddleware"),
  perm = require("../middlewares/permissionMiddleware"),
  P = require("../constants/permissions");
r.use(protect);
r.get("/", perm(P.PAYMENT_READ), c.list);
r.get("/:id", perm(P.PAYMENT_READ), c.get);
r.post("/", perm(P.PAYMENT_CREATE), c.create);
r.patch("/:id", perm(P.PAYMENT_UPDATE), c.update);
r.delete("/:id", perm(P.PAYMENT_DELETE), c.remove);
module.exports = r;
