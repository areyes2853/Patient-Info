const express = require("express");
const axios = require("axios");
const router = express.Router();

// @route   GET /api/get
// @desc    Main GET route info
// @access  Public
router.get("/", (req, res) => {
  res.json({
    message: "🏥 GET API Route",
    version: "1.0.0",
    endpoints: [
      "GET /api/get - This endpoint",
      "GET /api/get/test - Test endpoint",
      "GET /api/get/fhir/patients - List FHIR patients",
    ],
  });
});

// @route   GET /api/get/test
// @desc    Test endpoint
// @access  Public
router.get("/test", (req, res) => {
  res.json({
    status: "success",
    message: "GET test route is working!",
    timestamp: new Date().toISOString(),
  });
});

// @route   GET /api/get/fhir/patients
// @desc    Fetch FHIR patients
// @access  Public
router.get("/fhir/patient", async (req, res) => {
  try {
    // Example FHIR patient endpoint
    const fhirBaseUrl =
      process.env.FHIR_BASE_URL || "https://r4.smarthealthit.org";
    const response = await axios.get(`${fhirBaseUrl}/Patient`, {
      params: { _count: 10 },
    });
    res.json({
      success: true,
      source: fhirBaseUrl,
      data: response.data,
    });
  } catch (error) {
    console.error("FHIR Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch patients",
      message: error.message,
    });
  }
});

module.exports = router;
