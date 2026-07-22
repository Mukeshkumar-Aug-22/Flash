const asyncHandler = require('express-async-handler');
const { runAllScrapers } = require('../scrapers');
const SearchCache = require('../models/Product');
const SearchHistory = require('../models/SearchHistory');

const searchProducts = asyncHandler(async (req, res) => {

    const { query } = req.body;

    if (!query || query.trim() === '') {
        res.status(400);
        throw new Error('please Provide Product name or Product URL to Search');
    }

    const cleanQuery = query.trim().toLowerCase();

    const cachedResult = await SearchCache.findOne({ query: cleanQuery });

    if (cachedResult && cachedResult.results.length > 0) {
        console.log(`📦 Cache hit for: "${cleanQuery}"`);
        // return res.json({
        //     success: true,
        //     fromCache: true,
        //     results: cachedResult.results,
        //     totalResults: cachedResult.results.length,
        //     lowestPrice: cachedResult.results[0].price,
        //     lowestSite: cachedResult.results[0].site,
        // });

        return res.json({
            success: true,
            fromCache: true,
            results: cachedResult.results,
            totalResults: cachedResult.results.length,
            lowestPrice: cachedResult.results[0]?.price || 0,
            lowestSite: cachedResult.results[0]?.site || 'Unknown',
            searchTerm: cleanQuery,
            queryType: 'name'
        })

    }
    // ------------ Run All Scrapers ---------------

    const { results, searchTerm, queryType } = await runAllScrapers(cleanQuery);

    if (!results || results.length === 0) {
        res.status(404);
        throw new Error(`No results found for "${searchTerm}". Try a different search term.`);
    }

    // -------------- Calculate Stats ------------------

    const prices = results.map((r) => r.price);
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const savings = highestPrice - lowestPrice;
    const lowestResult = results.find((r) => r.price === lowestPrice);

    // -------------- Save Result to Cache ---------------
    // Next time the same query comes in → instant response:

    await SearchCache.create({
        query: cleanQuery,
        results,
    });

    // -------------- Save Result to History ---------------
    // Shown in the History page of the frontend

    await SearchHistory.create({
        query: cleanQuery,
        type: queryType,
        lowestPrice,
        lowestSite: lowestResult?.site || '',
        highestPrice,
        resultCount: results.length,
        savings,
    });

    // ------------ Send Response to Frontend --------------

    console.log('📤 Sending response with:', {
    totalResults: results.length,
    lowestPrice,
    lowestSite: lowestResult?.site
  })

    res.status(200).json({
        success: true,
        fromCache: false,
        searchTerm,
        queryType,
        totalResults: results.length,
        lowestPrice,
        lowestSite: lowestResult?.site || '',
        highestPrice,
        savings,
        results,
    });

});

const getHistory = asyncHandler(async (req, res) => {
    const history = await SearchHistory.find()
        .sort({ createdAt: -1 }) // newest first
        .limit(20);

    res.status(200).json({
        success: true,
        count: history.length,
        history,
    });
});

// -------------- Clear All History --------------- 

const clearHistory = asyncHandler(async (req, res) => {
    await SearchHistory.deleteMany({});
    res.status(200).json({
        success: true,
        message: "Search History Cleared Successfully",
    });
});

// ------------- Deletes one history item by MongoDB _id -------------

const deleteHistoryItem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const item = await SearchHistory.findByIdAndDelete(id);

    if (!item) {
        res.status(404);
        throw new Error('History item not found');
    }

    res.status(200).json({
        success: true,
        message: 'History item deleted',
    });
});

module.exports = {
    searchProducts,
    getHistory,
    clearHistory,
    deleteHistoryItem,
};

