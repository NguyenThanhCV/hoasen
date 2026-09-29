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
app.use(cors());
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
app.use("/api", routes);
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
