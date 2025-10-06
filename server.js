const express = require("express");
const cors = require("cors");
const hl7 = require("simple-hl7");
const axios = require("axios");
const morgan = require("morgan");
const connectDB = require("./config/db");

// Initialize Express app
const app = express();

// Ports configuration (MOVE THIS UP)
const EXPRESS_PORT = process.env.PORT || 3001; // Express API port
const HL7_PORT = process.env.HL7_PORT || 4000; // HL7 MLLP port

// Connect to MongoDB
connectDB();

// MIDDLEWARE MUST COME BEFORE ROUTES!
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get("/", (req, res) =>
  res.send("🏥 HL7 Medical Backend Server is running!")
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "Server is running!",
    timestamp: new Date().toISOString(),
    services: {
      express: `Running on port ${EXPRESS_PORT}`,
      hl7: `Running on port ${HL7_PORT}`,
    },
  });
});

// API Routes (AFTER middleware setup)
app.use("/api/get", require("./routes/api/get"));
app.use("/api/post", require("./routes/api/post"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path,
  });
});

// Start Express server
app.listen(EXPRESS_PORT, () => {
  console.log(
    `✅ Express API server running on http://localhost:${EXPRESS_PORT}`
  );
  console.log(`📍 Test endpoints:`);
  console.log(`   GET  http://localhost:${EXPRESS_PORT}/`);
  console.log(`   GET  http://localhost:${EXPRESS_PORT}/health`);
  console.log(`   GET  http://localhost:${EXPRESS_PORT}/api/get`);
  console.log(`   GET  http://localhost:${EXPRESS_PORT}/api/get/fhir/patients`);
  console.log(`   POST http://localhost:${EXPRESS_PORT}/api/post/hl7/send`);
});

// HL7 Server Setup (MLLP)
const hl7Server = hl7.Server.createTcpServer();

// HL7 message handler
hl7Server.on("hl7", (message) => {
  console.log("Received HL7 message:", message.log());
  const messageType = message.get("MSH|9");
  console.log("Message Type:", messageType);
  const ack = message.ack();
  message.respond(ack);
});

// HL7 error handler
hl7Server.on("error", (err) => {
  console.error("HL7 Server Error:", err);
});

// Start HL7 server
hl7Server.start(HL7_PORT);
console.log(`✅ HL7 MLLP server running on port ${HL7_PORT}`);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing servers");
  app.close(() => {
    console.log("Express server closed");
  });
  hl7Server.close(() => {
    console.log("HL7 server closed");
    process.exit(0);
  });
});

module.exports = app;
