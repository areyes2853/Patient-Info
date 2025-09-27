const express = require("express");
const axios = require("axios");
const hl7 = require("simple-hl7");

const app = express();
const PORT = process.env.PORT || 4000;


//test app is alive
app.get("/", (req, res) => {
  res.send("<h1>Server is running</h1>");
}); 

// fetch patient data from FHIR server
app.get("/api/patient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `https://hapi.fhir.org/baseR4/Patient/${id}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch patient data" });
  }
});

// HL7 listener
const hl7app = hl7.tcp();
hl7app.use((req, res, next) => {
  console.log("Received HL7 message:", req.msg.log());
  res.ack();
});

hl7app.start(4000); // start HL7 listener

app.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
});
