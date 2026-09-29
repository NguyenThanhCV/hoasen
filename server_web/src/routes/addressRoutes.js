const r = require("express").Router(),
  c = require("../controllers/addressController"),
  { protect } = require("../middlewares/authMiddleware");
r.use(protect);
r.get("/", c.list);
r.post("/", c.create);
r.get("/:id", c.get);
r.patch("/:id", c.update);
r.delete("/:id", c.remove);
module.exports = r;
