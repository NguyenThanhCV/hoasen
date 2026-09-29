const r = require("express").Router(),
  c = require("../controllers/productController"),
  { protect } = require("../middlewares/authMiddleware"),
  perm = require("../middlewares/permissionMiddleware"),
  P = require("../constants/permissions");
r.get("/", c.list);
r.get("/:id", c.get);
r.post("/", protect, perm(P.PRODUCT_CREATE), c.create);
r.patch("/:id", protect, perm(P.PRODUCT_UPDATE), c.update);
r.delete("/:id", protect, perm(P.PRODUCT_DELETE), c.remove);
module.exports = r;
