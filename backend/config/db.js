import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/taskflow";
    
    if (!mongoUri) {
      console.error("❌ MONGO_URI is not defined in environment variables");
      process.exit(1);
    }

    console.log(`🔗 Attempting to connect to MongoDB: ${mongoUri}`);
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    console.log("💡 Please ensure MongoDB is running on your system");
    console.log("💡 You can install MongoDB from: https://www.mongodb.com/try/download/community");
    console.log("💡 Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas");
    
    // Don't exit the process, let the server run without DB for now
    console.log("⚠️  Server will continue without database connection");
  }
};
