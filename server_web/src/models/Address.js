const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Address",
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      province: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
      ward: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      note: { type: String, trim: true },
      latitude: Number,
      longitude: Number,
      isDefault: { type: Boolean, default: false },
    },
    { timestamps: true },
  ),
);
