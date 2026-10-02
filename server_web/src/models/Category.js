const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Category",
  new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      nameEn: { type: String, trim: true, default: "" },
      slug: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
      },
      description: String,
      descriptionEn: { type: String, default: "" },
      image: String,
      // Optional image optimized for the storefront homepage category cards.
      homeImage: String,
      parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null,
      },
      level: { type: Number, default: 0 },
      sortOrder: { type: Number, default: 0 },
      productCount: { type: Number, default: 0 },
      status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true },
  ),
);
