const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ FATAL: MONGODB_URI environment variable is not set!');
    console.error('   → Go to Render Dashboard → your backend service → Environment tab');
    console.error('   → Add MONGODB_URI = your MongoDB Atlas connection string');
    console.error('   → Get a free Atlas cluster at: https://cloud.mongodb.com');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.error('   → Check your MONGODB_URI is correct');
      console.error('   → In MongoDB Atlas: Network Access → Allow access from anywhere (0.0.0.0/0)');
      process.exit(1);
    }
    console.warn('⚠️  Server continuing without DB for local development.');
  }
};

module.exports = connectDB;
