const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Coupon",
  new mongoose.Schema(
    {
      code: {
        type: String,
        required: true,
        unique: true,
        index: true,
        uppercase: true,
        trim: true,
      },
      name: { type: String, required: true },
      type: { type: String, enum: ["percentage", "fixed"], required: true },
      value: { type: Number, required: true, min: 0 },
      minOrderValue: { type: Number, default: 0, min: 0 },
      maxDiscount: { type: Number, min: 0 },
      usageLimit: { type: Number, min: 0 },
      usageLimitPerUser: { type: Number, min: 0, default: 1 },
      usedCount: { type: Number, default: 0, min: 0 },
      startDate: Date,
      endDate: Date,
      applicableProducts: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      ],
      applicableCategories: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      ],
      excludedProducts: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      ],
      status: {
        type: String,
        enum: ["active", "inactive", "expired"],
        default: "active",
      },
    },
    { timestamps: true },
  ),
);
