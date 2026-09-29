const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Notification",
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      type: {
        type: String,
        enum: ["order", "payment", "promotion", "system", "review"],
        required: true,
      },
      title: { type: String, required: true },
      message: { type: String, required: true },
      data: { type: mongoose.Schema.Types.Mixed, default: {} },
      isRead: { type: Boolean, default: false },
      readAt: Date,
    },
    { timestamps: true },
  ),
);
