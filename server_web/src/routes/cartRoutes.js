const r = require("express").Router(),
  c = require("../controllers/cartController"),
  { protect } = require("../middlewares/authMiddleware");
r.use(protect);
r.get("/", c.get);
r.post("/", c.create);
r.patch("/", c.update);
r.delete("/", c.remove);
r.post("/items", c.add);
r.patch("/items/:itemId", c.updateItem);
r.delete("/items/:itemId", c.removeItem);
r.delete("/clear", c.clear);
module.exports = r;
