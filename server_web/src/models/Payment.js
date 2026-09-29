const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Payment",
  new mongoose.Schema(
    {
      order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        unique: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      method: {
        type: String,
        enum: ["cod", "bank_transfer", "vnpay", "momo", "other"],
        required: true,
      },
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "VND" },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "cancelled", "refunded"],
        default: "pending",
      },
      provider: String,
      transactionId: String,
      paidAt: Date,
      failedAt: Date,
      metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true },
  ),
);
