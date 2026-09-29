const r = require("express").Router(),
  c = require("../controllers/notificationController"),
  { protect } = require("../middlewares/authMiddleware"),
  AppError = require("../utils/AppError");
r.use(protect);
r.get("/", c.list);
r.post("/", (req, res, next) =>
  next(new AppError("Sử dụng API quản trị để tạo thông báo", 405)),
);
r.get("/:id", c.get);
r.patch("/:id", (req, res, next) =>
  next(new AppError("Không hỗ trợ sửa thông báo", 405)),
);
r.patch("/:id/read", c.read);
r.post("/read-all", c.readAll);
r.delete("/:id", c.remove);
module.exports = r;
