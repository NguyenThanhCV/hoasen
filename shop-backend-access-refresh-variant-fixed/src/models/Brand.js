const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Brand",
  new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true, maxLength: 100 },
      slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      logo: String,
      description: String,
      website: String,
      sortOrder: { type: Number, default: 0 },
      status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true },
  ),
);
