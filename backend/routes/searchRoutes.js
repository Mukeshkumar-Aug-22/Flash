const express = require('express');
const router = express.Router();
const {
  searchProducts,
  getHistory,
  clearHistory,
  deleteHistoryItem,
} = require('../controllers/searchController');
const { searchLimiter } = require('../middleware/rateLimiter');

// =============================================
//   Search Routes
//   Base path: /api/search  (set in server.js)
// =============================================

// POST /api/search
// Body: { query: "iPhone 15" } or { query: "https://amazon.in/..." }
// Rate limited: 10 searches per 15 minutes per IP

router.post('/', searchLimiter, searchProducts);

// GET /api/search/history
// Returns last 20 searches with price info

router.get('/history', getHistory);

// DELETE /api/search/history
// Clears all search history

router.delete('/history', clearHistory);

// DELETE /api/search/history/:id
// Deletes a single history entry by MongoDB ID

router.delete('/history/:id', deleteHistoryItem);

module.exports = router;