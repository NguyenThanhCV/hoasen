const r = require("express").Router(),
  c = require("../controllers/orderItemController"),
  { protect } = require("../middlewares/authMiddleware"),
  perm = require("../middlewares/permissionMiddleware"),
  P = require("../constants/permissions");
r.use(protect);
r.get("/", perm(P.ORDERITEM_READ), c.list);
r.get("/:id", perm(P.ORDERITEM_READ), c.get);
r.post("/", perm(P.ORDERITEM_CREATE), c.create);
r.patch("/:id", perm(P.ORDERITEM_UPDATE), c.update);
r.delete("/:id", perm(P.ORDERITEM_DELETE), c.remove);
module.exports = r;
