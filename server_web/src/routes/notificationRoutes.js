const r = require("express").Router(),
  c = require("../controllers/notificationController"),
  { protect } = require("../middlewares/authMiddleware"),
  perm = require("../middlewares/permissionMiddleware"),
  P = require("../constants/permissions");
r.use(protect);
r.get("/", c.list);
r.post("/", perm(P.NOTIFICATION_CREATE), c.create);
r.get("/:id", c.get);
r.patch("/:id", c.update);
r.patch("/:id/read", c.read);
r.post("/read-all", c.readAll);
r.delete("/:id", c.remove);
module.exports = r;
