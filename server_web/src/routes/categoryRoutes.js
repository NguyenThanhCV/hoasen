const r = require("express").Router(),
  c = require("../controllers/categoryController"),
  { protect } = require("../middlewares/authMiddleware"),
  perm = require("../middlewares/permissionMiddleware"),
  P = require("../constants/permissions");
r.get("/", c.list);
r.get("/:id", c.get);
r.post("/", protect, perm(P.CATEGORY_CREATE), c.create);
r.patch("/:id", protect, perm(P.CATEGORY_UPDATE), c.update);
r.delete("/:id", protect, perm(P.CATEGORY_DELETE), c.remove);
module.exports = r;
