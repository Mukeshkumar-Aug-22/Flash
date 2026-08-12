require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const connectDB = require('./config/db');
const searchRoutes = require('./routes/searchRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// =============================================
// CORS - CORRECTED (No wildcard options)
// =============================================
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
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

// Health Check Route
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
    },
  });
});

// API Routes
app.use('/api/search', searchRoutes);

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('⚡ ================================== ⚡');
  console.log(`   Flash AI Server running on port ${PORT}`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log('⚡ ================================== ⚡');
  console.log('');
});