const mongoose = require("mongoose");
const address = {
  fullName: String,
  phone: String,
  province: String,
  district: String,
  ward: String,
  address: String,
  note: String,
  latitude: Number,
  longitude: Number,
};
module.exports = mongoose.model(
  "Order",
  new mongoose.Schema(
    {
      orderNumber: { type: String, required: true, unique: true, index: true },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      customer: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        email: String,
      },
      address: {
        type: new mongoose.Schema(address, { _id: false }),
        required: true,
      },
      subtotal: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
      coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
        default: null,
      },
      paymentMethod: {
        type: String,
        enum: ["cod", "bank_transfer", "vnpay", "momo", "other"],
        required: true,
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "cancelled", "refunded"],
        default: "pending",
      },
      orderStatus: {
        type: String,
        enum: [
          "pending",
          "confirmed",
          "processing",
          "completed",
          "cancelled",
          "refunded",
        ],
        default: "pending",
      },
      note: String,
      cancelledAt: Date,
      completedAt: Date,
    },
    { timestamps: true },
  ),
);
