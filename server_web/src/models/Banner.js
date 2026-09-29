const mongoose = require("mongoose");

const pageKeys = [
  "home", "products", "product-detail", "categories", "brands", "news", "news-detail",
  "about", "contact", "faq", "privacy", "terms", "cart", "checkout", "orders",
  "order-detail", "wishlist", "notifications", "addresses", "account", "general",
];

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  pageKey: { type: String, required: true, enum: pageKeys, index: true },
  imageUrl: { type: String, required: true, trim: true },
  mobileImageUrl: { type: String, default: "", trim: true },
  altText: { type: String, default: "", trim: true, maxlength: 180 },
  eyebrow: { type: String, default: "", trim: true, maxlength: 80 },
  title: { type: String, default: "", trim: true, maxlength: 180 },
  description: { type: String, default: "", trim: true, maxlength: 360 },
  buttonText: { type: String, default: "", trim: true, maxlength: 60 },
  buttonLink: { type: String, default: "", trim: true, maxlength: 500 },
  status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  sortOrder: { type: Number, default: 0, min: 0 },
  startsAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },
  textPosition: { type: String, enum: ["left", "center", "right"], default: "left" },
  overlayOpacity: { type: Number, default: 0.45, min: 0, max: 0.9 },
  seedKey: { type: String, default: undefined, unique: true, sparse: true, select: false },
}, { timestamps: true });

schema.index({ pageKey: 1, status: 1, sortOrder: 1 });
module.exports = mongoose.model("Banner", schema);
module.exports.pageKeys = pageKeys;
