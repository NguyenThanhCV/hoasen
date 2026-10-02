const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  nameEn: { type: String, trim: true, maxlength: 80, default: "" },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  description: { type: String, trim: true, maxlength: 240 },
  descriptionEn: { type: String, trim: true, maxlength: 240, default: "" },
  coverImage: { type: String, default: "" },
  sortOrder: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
}, { timestamps: true });

module.exports = mongoose.model("NewsCategory", schema);
