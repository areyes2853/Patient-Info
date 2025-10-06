// const mongoose = require("mongoose");
// const config = require("config");
// const db = config.get("mongoURI");

// const connectDB = async () => {
//   try {
//     await mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true});
//       console.log("MongoDB Connected...");
//     } catch (err) {
//     console.error(err.message);
//     // Exit process with failure
//       process.exit(1);
//     }
// };

// module.exports = connectDB;


const mongoose = require("mongoose");
require("dotenv").config(); // Load .env file

const connectDB = async () => {
  try {
    // Use environment variable or default connection string
    const db =
      process.env.MONGODB_URI || "mongodb://localhost:27017/medical_app";

    // For Docker MongoDB with auth
    // const db = process.env.MONGODB_URI || "mongodb://admin:password123@localhost:27017/medical_app?authSource=admin";

    console.log("🔄 Connecting to MongoDB...");
    console.log(
      "📍 Database URL:",
      db.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")
    );

    // Connect without deprecated options
    await mongoose.connect(db);

    console.log("✅ MongoDB Connected Successfully!");
    console.log("📊 Database:", mongoose.connection.name);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:");
    console.error("   Message:", err.message);

    if (err.message.includes("ECONNREFUSED")) {
      console.error("\n💡 MongoDB is not running. Start it with:");
      console.error("   Docker: docker-compose up mongodb -d");
      console.error("   Local: mongod");
    }

    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;