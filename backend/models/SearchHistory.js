const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema({

    query: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['name', 'url'],
        default: 'name',
    },
    lowestPrice: {
        type: Number,
        default: null,
        // The cheapest price found across all sites
    },
    lowestSite: {
        type: String,
        default: null,
        // Which site had the lowest price
    },
    highestPrice: {
        type: Number,
        default: null,
        // The most expensive price found
    },
    resultCount: {
        type: Number,
        default: 0,
        // How many total results were found
    },
    savings: {
        type: Number,
        default: null,
        // Difference between highest and lowest price
    },

}, {timestamps: true,},);

module.exports = mongoose.model("searchHistory", searchHistorySchema);