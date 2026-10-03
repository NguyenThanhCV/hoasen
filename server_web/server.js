require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./src/config/db");
const routes = require("./src/routes");
const notFound = require("./src/middlewares/notFoundMiddleware");
const errorHandler = require("./src/middlewares/errorMiddleware");

const app = express();
app.use(helmet());
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.ADMIN_ORIGIN,
  ...(process.env.EXTRA_CORS_ORIGINS || "").split(","),
]
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(
  cors({
    origin(origin, callback) {
      const localDevelopmentOrigin =
        process.env.NODE_ENV !== "production" &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");
      if (
        !origin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin) ||
        localDevelopmentOrigin
      )
        return callback(null, true);
      callback(new Error("Origin không được phép"));
    },
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    // Storefront traffic is shared by every device behind the same router.
    // Keep a generous API ceiling so normal browsing does not lock out a shop.
    max: 5000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Hệ thống đang nhận nhiều yêu cầu. Vui lòng thử lại sau ít phút.",
    },
  }),
);
app.get("/", (req, res) =>
  res.json({ success: true, message: "Shop API running" }),
);
const apiPrefix = (process.env.API_PREFIX || "/api").replace(/\/+$/, "");
app.use(apiPrefix.startsWith("/") ? apiPrefix : `/${apiPrefix}`, routes);
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  const port = process.env.PORT || 5000;
  app.listen(port, "0.0.0.0", () => console.log(`API running on 0.0.0.0:${port}`));
};
start().catch((e) => {
  console.error(e);
  process.exit(1);
});
