const r = require("express").Router(),
  c = require("../controllers/reviewController"),
  { protect } = require("../middlewares/authMiddleware"),
  perm = require("../middlewares/permissionMiddleware"),
  P = require("../constants/permissions");
r.get("/product/:productId", c.list);
r.use(protect);
r.get("/:id", c.get);
r.post("/", perm(P.REVIEW_CREATE), c.create);
r.patch("/:id", perm(P.REVIEW_UPDATE), c.update);
r.delete("/:id", perm(P.REVIEW_DELETE), c.remove);
r.patch("/:id/moderate", perm(P.REVIEW_MODERATE), c.moderate);
module.exports = r;
