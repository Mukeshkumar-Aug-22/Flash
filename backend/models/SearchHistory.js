const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema(
  {
    query: { type: String, required: true, trim: true },
    type: { type: String, enum: ['name', 'url'], default: 'name' },
    lowestPrice: { type: Number, default: null },
    lowestSite: { type: String, default: null },
    highestPrice: { type: Number, default: null },
    resultCount: { type: Number, default: 0 },
    savings: { type: Number, default: null },
  },
  { timestamps: true }
);

searchHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);