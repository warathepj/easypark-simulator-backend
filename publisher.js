const express = require('express');
const cors = require('cors');
const mqtt = require('mqtt');
const app = express();

// Enable CORS for all routes
app.use(cors());
// Parse JSON bodies
app.use(express.json());

// Connect to the public MQTT broker
const client = mqtt.connect('mqtt://test.mosquitto.org:1883');

client.on('connect', () => {
  console.log('Connected to MQTT broker');
});

client.on('error', (error) => {
  console.error('MQTT Error:', error);
});

app.post('/parking-data', (req, res) => {
  console.log('----------------------------------------');
  console.log('Received parking data at:', new Date().toISOString());
  console.log('Data:', JSON.stringify(req.body, null, 2));
  console.log('----------------------------------------');
  
  // Publish the data to MQTT
  client.publish('parking/data', JSON.stringify(req.body), (err) => {
    if (err) {
      console.error('Failed to publish to MQTT:', err);
      return res.status(500).json({ success: false, message: 'Failed to publish to MQTT' });
    }
    res.json({ success: true, message: 'Data received and published successfully' });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Publisher server running on port ${PORT}`);
})
