const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  titleEn: { type: String, trim: true, maxlength: 180, default: "" },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  excerpt: { type: String, required: true, trim: true, maxlength: 360 },
  excerptEn: { type: String, trim: true, maxlength: 360, default: "" },
  content: { type: String, required: true },
  contentEn: { type: String, default: "" },
  coverImage: { type: String, default: "" },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "NewsCategory", required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  tags: { type: [String], default: [] },
  tagsEn: { type: [String], default: [] },
  status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
  publishedAt: { type: Date, default: null, index: true },
  readingMinutes: { type: Number, default: 3, min: 1 },
  views: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

schema.index({ status: 1, publishedAt: -1 });
module.exports = mongoose.model("NewsArticle", schema);
