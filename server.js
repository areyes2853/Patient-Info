const express = require("express");
const cors = require("cors");
const hl7 = require("simple-hl7");
const axios = require("axios");

// Initialize Express app
const app = express();

// Ports configuration
const EXPRESS_PORT = process.env.PORT || 3001; // Express API port
const HL7_PORT = process.env.HL7_PORT || 4000; // HL7 MLLP port

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🏥 HL7 Medical Backend Server",
    version: "1.0.0",
    endpoints: [
      "GET /health - Health check",
      "GET /api/fhir/patients - List FHIR patients",
      "POST /api/hl7/send - Send HL7 message",
    ],
  });
});

// FHIR endpoints
app.get("/api/fhir/patients", async (req, res) => {
  try {
    // Example FHIR patient endpoint
    const fhirBaseUrl =
      process.env.FHIR_BASE_URL || "https://r4.smarthealthit.org";
    const response = await axios.get(`${fhirBaseUrl}/Patient`, {
      params: { _count: 10 },
    });
    res.json(response.data);
  } catch (error) {
    console.error("FHIR Error:", error.message);
    res.status(500).json({
      error: "Failed to fetch patients",
      message: error.message,
    });
  }
});

// HL7 message endpoint
app.post("/api/hl7/send", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Example HL7 message processing
  res.json({
    success: true,
    message: "HL7 message received",
    timestamp: new Date().toISOString(),
  });
});

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
  console.log(`📍 Health check: http://localhost:${EXPRESS_PORT}/health`);
});

// HL7 Server Setup (MLLP)
const hl7Server = hl7.Server.createTcpServer();

// HL7 message handler
hl7Server.on("hl7", (message) => {
  console.log("Received HL7 message:", message.log());

  // Parse and process HL7 message
  const messageType = message.get("MSH|9");
  console.log("Message Type:", messageType);

  // Send ACK
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

  // Close Express server
  app.close(() => {
    console.log("Express server closed");
  });

  // Close HL7 server
  hl7Server.close(() => {
    console.log("HL7 server closed");
    process.exit(0);
  });
});

module.exports = app;
