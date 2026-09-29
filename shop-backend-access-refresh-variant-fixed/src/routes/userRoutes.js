const r = require("express").Router(),
  c = require("../controllers/userController"),
  { protect } = require("../middlewares/authMiddleware"),
  perm = require("../middlewares/permissionMiddleware"),
  P = require("../constants/permissions");
r.use(protect);
r.get("/stats", perm(P.USER_READ), c.stats);
r.get("/", perm(P.USER_READ), c.list);
r.post("/", perm(P.USER_CREATE), c.create);
r.get("/:id", perm(P.USER_READ), c.get);
r.patch("/:id", perm(P.USER_UPDATE), c.update);
r.patch("/:id/status", perm(P.USER_STATUS), c.status);
r.patch("/:id/role", perm(P.USER_ROLE), c.role);
r.patch("/:id/permissions", perm(P.USER_PERMISSIONS), c.permissions);
r.delete("/:id", perm(P.USER_DELETE), c.remove);
module.exports = r;
