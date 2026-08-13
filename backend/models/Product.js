const mongoose = require('mongoose');

const productResultSchema = new mongoose.Schema({
  site: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: null },
  discount: { type: String, default: null },
  image: { type: String, default: '' },
  url: { type: String, required: true },
  rating: { type: Number, default: null },
  ratingCount: { type: String, default: null },
  inStock: { type: Boolean, default: true },
});

const searchCacheSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  results: {
    type: [productResultSchema],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,
  },
});

module.exports = mongoose.model('SearchCache', searchCacheSchema);