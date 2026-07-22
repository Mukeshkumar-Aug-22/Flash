const rateLimit = require('express-rate-limit');

// =============================================
//   Rate Limiter for /api/search
//   Prevents users from spamming the scraper
//   Max: 10 searches per 15 minutes per IP
// =============================================
const searchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // Max 10 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many search requests. Please wait 15 minutes before searching again.',
    },
});

// =============================================
//   General API Rate Limiter
//   Max: 100 requests per 15 minutes per IP
// =============================================
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.',
    },
});

module.exports = { searchLimiter, generalLimiter };