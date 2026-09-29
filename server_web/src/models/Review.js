const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Review",
  new mongoose.Schema(
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        index: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null,
      },
      rating: { type: Number, required: true, min: 1, max: 5 },
      title: String,
      content: String,
      images: [String],
      videos: [String],
      verifiedPurchase: { type: Boolean, default: false },
      helpfulCount: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
    },
    { timestamps: true },
  ),
);
