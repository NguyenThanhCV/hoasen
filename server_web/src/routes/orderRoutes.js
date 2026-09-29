const r = require("express").Router(),
  c = require("../controllers/orderController"),
  { protect } = require("../middlewares/authMiddleware"),
  perm = require("../middlewares/permissionMiddleware"),
  P = require("../constants/permissions");
r.use(protect);
r.get("/", perm(P.ORDER_READ), c.list);
r.post("/", perm(P.ORDER_CREATE), c.create);
r.get("/:id", perm(P.ORDER_READ), c.get);
r.patch("/:id", perm(P.ORDER_UPDATE), c.update);
r.patch("/:id/cancel", perm(P.ORDER_CANCEL), c.cancel);
r.delete("/:id", perm(P.ORDER_DELETE), c.remove);
module.exports = r;
