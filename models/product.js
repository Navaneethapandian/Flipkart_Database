const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: { type: String, unique: true, default: () => Date.now().toString() },
  title: String,
  description: String,
  price: Number,
  stock: Number,
  brand: String,
  ratings: Number,
  status: { type: String, default: "active" }
});

module.exports = mongoose.model("Product", productSchema);