const mongoose = require("mongoose");

// Schema for a single product result from one site: 

const productResultSchema = new mongoose.Schema({

    site: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    originalPrice: {
        type: Number,
        default: null,
    },
    discount: {
        type: String,
        default: null,
    },
    image: {
        type: String,
        default: '',
    },
    url: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        default: null,
        // e.g. 4.3
    },
    ratingCount: {
        type: String,
        default: null,
        // e.g. "12,345 ratings"
    },
    inStock: {
        type: Boolean,
        default: true,
    },

});

// Schema for caching search results (1 hour TTL)
// This avoids re-scraping the same product query:

const SearchCacheSchema = new mongoose.Schema({
    query: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    results: [productResultSchema],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600, // MongoDB auto-deletes this document after 1 hour
    },
});

module.exports = mongoose.model("SearchCache", SearchCacheSchema);