const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    count: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

schema.index({ coupon: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("CouponRedemption", schema);
