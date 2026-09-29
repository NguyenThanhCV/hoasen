const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const controller = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

// Count failed attempts only, so normal successful sign-ins do not consume the
// shared per-IP allowance used by customers on the same network.
const authAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.",
  },
});

router.post("/register", authAttemptLimiter, controller.register);
router.post("/login", authAttemptLimiter, controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);

router.get("/me", protect, controller.me);
router.patch("/me", protect, controller.updateMe);
router.patch("/change-password", protect, controller.changePassword);
router.post("/logout-all", protect, controller.logoutAll);

router.post("/createadmin", controller.createAdmin);

module.exports = router;
