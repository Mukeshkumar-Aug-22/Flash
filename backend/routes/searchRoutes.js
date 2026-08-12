const express = require('express');
const router = express.Router();
const {
  searchProducts,
  getHistory,
  clearHistory,
  deleteHistoryItem,
} = require('../controllers/searchController');
const { searchLimiter } = require('../middleware/rateLimiter');

// POST /api/search - Search for products
router.post('/', searchLimiter, searchProducts);

// GET /api/search/history - Get search history
router.get('/history', getHistory);

// DELETE /api/search/history - Clear all history
router.delete('/history', clearHistory);

// DELETE /api/search/history/:id - Delete one history item
router.delete('/history/:id', deleteHistoryItem);

module.exports = router;