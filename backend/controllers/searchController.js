
const asyncHandler = require('express-async-handler');
const { runAllScrapers } = require('../scrapers');
const SearchCache = require('../models/Product');
const SearchHistory = require('../models/SearchHistory');

const searchProducts = asyncHandler(async (req, res) => {
  console.log('🔍 Search request received:', req.body);
  
  const { query } = req.body;

  if (!query || query.trim() === '') {
    console.log('❌ Empty query');
    res.status(400);
    throw new Error('Please provide a product name or URL to search');
  }

  const cleanQuery = query.trim().toLowerCase();
  console.log(`📝 Clean query: "${cleanQuery}"`);

  try {
    // Check cache first
    console.log('🔍 Checking cache...');
    const cachedResult = await SearchCache.findOne({ query: cleanQuery });
    console.log('📦 Cache result:', cachedResult ? 'FOUND' : 'NOT FOUND');

    if (cachedResult && cachedResult.results && cachedResult.results.length > 0) {
      console.log(`📦 Cache hit for: "${cleanQuery}" (${cachedResult.results.length} results)`);
      return res.json({
        success: true,
        fromCache: true,
        results: cachedResult.results,
        totalResults: cachedResult.results.length,
        lowestPrice: cachedResult.results[0]?.price || 0,
        lowestSite: cachedResult.results[0]?.site || '',
      });
    }

    console.log(`🕸️ Cache miss. Running scrapers for: "${cleanQuery}"`);
    const { results, searchTerm, queryType } = await runAllScrapers(cleanQuery);
    console.log(`📊 Scraping complete. Found ${results?.length || 0} results`);

    if (!results || results.length === 0) {
      console.log('❌ No results found');
      res.status(404);
      throw new Error(`No results found for "${searchTerm}". Try a different search term.`);
    }

    // Calculate stats
    const prices = results.map((r) => r.price).filter(p => p > 0);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const savings = highestPrice - lowestPrice;
    const lowestResult = results.find((r) => r.price === lowestPrice);

    console.log(`📊 Stats: Lowest=${lowestPrice}, Highest=${highestPrice}, Savings=${savings}`);

    // Save to cache
    try {
      await SearchCache.create({
        query: cleanQuery,
        results: results,
      });
      console.log('💾 Saved to cache');
    } catch (cacheError) {
      console.log('⚠️ Cache save error (non-critical):', cacheError.message);
    }

    // Save to history
    try {
      await SearchHistory.create({
        query: cleanQuery,
        type: queryType,
        lowestPrice: lowestPrice,
        lowestSite: lowestResult?.site || '',
        highestPrice: highestPrice,
        resultCount: results.length,
        savings: savings,
      });
      console.log('💾 Saved to history');
    } catch (historyError) {
      console.log('⚠️ History save error (non-critical):', historyError.message);
    }

    const responseData = {
      success: true,
      fromCache: false,
      searchTerm: searchTerm,
      queryType: queryType,
      totalResults: results.length,
      lowestPrice: lowestPrice,
      lowestSite: lowestResult?.site || '',
      highestPrice: highestPrice,
      savings: savings,
      results: results,
    };
    
    console.log(`✅ Sending response with ${results.length} products`);
    res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ Error in searchProducts:', error.message);
    console.error('Stack:', error.stack);
    // Re-throw for asyncHandler to catch
    throw error;
  }
});

const getHistory = asyncHandler(async (req, res) => {
  console.log('📜 Getting history...');
  const history = await SearchHistory.find()
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({
    success: true,
    count: history.length,
    history: history,
  });
});

const clearHistory = asyncHandler(async (req, res) => {
  console.log('🗑️ Clearing all history...');
  await SearchHistory.deleteMany({});
  res.status(200).json({
    success: true,
    message: 'Search history cleared successfully',
  });
});

const deleteHistoryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Deleting history item: ${id}`);

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