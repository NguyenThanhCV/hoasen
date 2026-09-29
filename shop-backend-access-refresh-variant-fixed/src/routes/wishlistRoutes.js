const r = require("express").Router(),
  c = require("../controllers/wishlistController"),
  { protect } = require("../middlewares/authMiddleware");
r.use(protect);
r.get("/", c.get);
r.post("/", c.create);
r.patch("/", c.create);
r.delete("/", c.clear);
r.post("/products", c.add);
r.delete("/products/:productId", c.remove);
module.exports = r;
