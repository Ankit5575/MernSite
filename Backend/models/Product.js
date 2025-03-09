const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    countInStock: { type: Number, required: true, default: 0 },
    sku: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    colors: { type: [String], required: true },
    sizes: { type: [String], required: true }, // ✅ Added sizes field
    collection: { type: String, required: true },
    material: { type: String },
    gender: { type: String, enum: ["Men", "Women", "Unisex"] },
    images: [{ type: String, required: true }], // Accepts an array of image URLs
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    newReviews: { type: Number, default: 0 },
    tags: [String],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    weight: { type: Number },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
