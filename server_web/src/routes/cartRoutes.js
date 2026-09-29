const r = require("express").Router(),
  c = require("../controllers/cartController"),
  { protect } = require("../middlewares/authMiddleware"),
  AppError = require("../utils/AppError");
r.use(protect);
r.get("/", c.get);
const rejectDirectWrite = (req, res, next) =>
  next(new AppError("Không hỗ trợ ghi cart trực tiếp", 405));
r.post("/", rejectDirectWrite);
r.patch("/", rejectDirectWrite);
r.delete("/", c.remove);
r.post("/items", c.add);
r.patch("/items/:itemId", c.updateItem);
r.delete("/items/:itemId", c.removeItem);
r.delete("/clear", c.clear);
module.exports = r;
