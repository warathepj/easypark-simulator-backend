const express = require('express');
const cors = require('cors');
const mqtt = require('mqtt');
const app = express();
require('dotenv').config();

// Enable CORS for all routes
app.use(cors());
// Parse JSON bodies
app.use(express.json());

// Connect to the public MQTT broker
const client = mqtt.connect(process.env.BROKER_URL, {
  username: process.env.USER,
  password: process.env.PASSWORD
});

client.on('connect', () => {
  console.log('Connected to MQTT broker');
});

client.on('error', (error) => {
  console.error('MQTT Error:', error);
});

app.post('/parking-data', (req, res) => {
  const timestamp = new Date().toISOString();
  const data = req.body;
  
  // Log data with clear formatting
  console.log('\n========== Parking Data Received ==========');
  console.log('Timestamp:', timestamp);
  console.log('Data:', JSON.stringify(data, null, 2));
  console.log('=========================================\n');

  // Add timestamp to the data before publishing
  const enrichedData = {
    ...data,
    timestamp
  };
  
  // Publish the enriched data to MQTT
  client.publish('parking/data', JSON.stringify(enrichedData), (err) => {
    if (err) {
      console.error('Failed to publish to MQTT:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to publish to MQTT',
        error: err.message 
      });
    }
    
    console.log('Successfully published to MQTT broker');
    res.json({ 
      success: true, 
      message: 'Data received and published successfully',
      timestamp 
    });
  });
});

const PORT = 3004;
app.listen(PORT, () => {
  console.log(`Publisher server running on port ${PORT}`);
})
