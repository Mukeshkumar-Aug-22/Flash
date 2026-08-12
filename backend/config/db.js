const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try both possible environment variable names
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URL;
    
    if (!mongoURI) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error('👉 Check your MONGO_URI or MONGODB_URL in .env file');
    process.exit(1);
  }
};

module.exports = connectDB;