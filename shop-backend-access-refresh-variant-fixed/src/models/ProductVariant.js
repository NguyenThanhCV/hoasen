const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    sku: { type: String, required: true, unique: true, trim: true },
    barcode: String,
    attributes: { type: Map, of: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    reservedStock: { type: Number, default: 0, min: 0 },
    thumbnail: String,
    images: [String],
    weight: Number,
    dimensions: { length: Number, width: Number, height: Number },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
schema.virtual("availableStock").get(function () {
  return Math.max(this.stock - this.reservedStock, 0);
});
schema.set("toJSON", { virtuals: true });
module.exports = mongoose.model("ProductVariant", schema);
