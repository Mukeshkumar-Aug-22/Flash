require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const connectDB = require('./config/db');
const searchRoutes = require('./routes/searchRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// =============================================
// CORS Configuration
// =============================================
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    process.env.CLIENT_URL || "https://flash-deal-frontend.onrender.com"
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
};

app.use(cors(corsOptions));

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Request Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter (optional - uncomment if needed)
// app.use('/api', generalLimiter);

// =============================================
// HEALTH CHECK ROUTE
// =============================================
app.get('/', (req, res) => {
  res.json({
    message: '⚡ Flash AI API is running!',
    version: '1.0.0',
    status: 'OK',
    endpoints: {
      search: 'POST /api/search',
      history: 'GET /api/search/history',
      clearHistory: 'DELETE /api/search/history',
      deleteOne: 'DELETE /api/search/history/:id',
      testChrome: 'GET /test-chrome',
    },
  });
});

// =============================================
// 🧪 TEST CHROME ENDPOINT (CRITICAL FOR DEBUGGING)
// =============================================
app.get('/test-chrome', async (req, res) => {
  try {
    const puppeteer = require('puppeteer-core');
    const fs = require('fs');
    
    // Check multiple Chrome paths
    const chromePaths = [
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/opt/google/chrome/chrome',
      '/usr/bin/google-chrome',
      process.env.CHROME_PATH,
    ].filter(Boolean);
    
    let foundPath = null;
    const pathChecks = [];
    
    for (const path of chromePaths) {
      const exists = fs.existsSync(path);
      pathChecks.push({ path, exists });
      if (exists) {
        foundPath = path;
        break;
      }
    }
    
    if (!foundPath) {
      return res.json({ 
        success: false, 
        message: 'Chrome not found on system',
        checkedPaths: pathChecks,
        environment: process.env.NODE_ENV,
      });
    }
    
    // Try to launch Chrome
    console.log(`✅ Test: Launching Chrome at ${foundPath}`);
    const browser = await puppeteer.launch({
      executablePath: foundPath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      timeout: 10000,
    });
    
    const page = await browser.newPage();
    await page.goto('https://www.google.com', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });
    const title = await page.title();
    await browser.close();
    
    res.json({ 
      success: true, 
      message: 'Chrome works! ✅',
      chromePath: foundPath,
      pageTitle: title,
      checkedPaths: pathChecks,
    });
    
  } catch (error) {
    console.error('❌ Chrome test error:', error.message);
    res.json({ 
      success: false, 
      error: error.message,
      stack: error.stack,
    });
  }
});

// =============================================
// API ROUTES
// =============================================
app.use('/api/search', searchRoutes);

// =============================================
// ERROR HANDLING (MUST BE LAST)
// =============================================
app.use(notFound);
app.use(errorHandler);

// =============================================
// START SERVER
// =============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('⚡ ================================== ⚡');
  console.log(`   Flash AI Server running on port ${PORT}`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log('⚡ ================================== ⚡');
  console.log('');
  console.log('🔧 Test Chrome endpoint:');
  console.log(`   http://localhost:${PORT}/test-chrome`);
  console.log('');
});