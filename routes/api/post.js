const express = require("express");
const router = express.Router();

// @route   GET /api/post
// @desc    Main POST route info
// @access  Public
router.get("/", (req, res) => {
  res.json({
    message: "POST API Route",
    endpoints: [
      "GET /api/post - This info endpoint",
      "POST /api/post/test - Test POST endpoint",
      "POST /api/post/hl7/send - Send HL7 message",
    ],
  });
});

// @route   POST /api/post/test
// @desc    Test POST endpoint
// @access  Public
router.post("/test", (req, res) => {
  res.json({
    success: true,
    message: "POST test route is working!",
    receivedData: req.body,
    timestamp: new Date().toISOString(),
  });
});

// @route   POST /api/post/hl7/send
// @desc    Send HL7 message
// @access  Public
router.post("/hl7/send", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      error: "Message is required",
    });
  }

  // Example HL7 message processing
  res.json({
    success: true,
    message: "HL7 message received",
    receivedMessage: message,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
