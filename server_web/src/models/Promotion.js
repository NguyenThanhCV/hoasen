const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    scope: { type: String, enum: ["product", "category", "brand"], required: true },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    brandIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true },
);

schema.index({ status: 1, startDate: 1, endDate: 1 });
module.exports = mongoose.model("Promotion", schema);
