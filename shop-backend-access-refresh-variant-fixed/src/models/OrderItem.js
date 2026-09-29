const mongoose = require("mongoose");
module.exports = mongoose.model(
  "OrderItem",
  new mongoose.Schema(
    {
      order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        index: true,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      variant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductVariant",
        required: true,
      },
      productName: { type: String, required: true },
      variantName: String,
      sku: String,
      attributes: { type: Map, of: String, default: {} },
      image: String,
      price: { type: Number, required: true, min: 0 },
      quantity: { type: Number, required: true, min: 1 },
      discount: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    { timestamps: true },
  ),
);
