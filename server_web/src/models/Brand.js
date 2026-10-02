const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Brand",
  new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true, maxLength: 100 },
      nameEn: { type: String, trim: true, maxLength: 100, default: "" },
      slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      logo: String,
      description: String,
      descriptionEn: { type: String, default: "" },
      website: String,
      sortOrder: { type: Number, default: 0 },
      status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true },
  ),
);
