const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const mqtt = require('mqtt');
const cors = require('cors');

const app = express();
const PORT = 3000;


app.use(cors());
app.use(express.json());


const db = new sqlite3.Database('./weather.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        db.run(`CREATE TABLE IF NOT EXISTS weather (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            temperature REAL,
            humidity REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        console.log("Connected to SQLite database");
    }
});


const mqttClient = mqtt.connect('ws://157.173.101.159:9001');

mqttClient.on('connect', () => {
    console.log("Connected to MQTT via WebSockets");
    mqttClient.subscribe("/hope/room_temp/temperature");
    mqttClient.subscribe("/hope/room_temp/humidity");
});

let latestData = { temperature: null, humidity: null };

mqttClient.on('message', (topic, message) => {
    const value = parseFloat(message.toString());

    if (topic === "/hope/room_temp/temperature") {
        latestData.temperature = value;
    } else if (topic === "/hope/room_temp/humidity") {
        latestData.humidity = value;
    }

    if (latestData.temperature !== null && latestData.humidity !== null) {
        db.run(`INSERT INTO weather (temperature, humidity) VALUES (?, ?)`, 
            [latestData.temperature, latestData.humidity], 
            (err) => {
                if (err) console.error("Error inserting data:", err.message);
            }
        );
    }
});


app.get('/data', (req, res) => {
    db.all(`
        SELECT 
            strftime('%s', timestamp) AS timestamp_utc,  -- Get UNIX timestamp in UTC
            AVG(temperature) as avgTemp,
            AVG(humidity) as avgHumidity
        FROM weather
        GROUP BY timestamp_utc / 300  -- Group data every 5 minutes
        ORDER BY timestamp_utc DESC
        LIMIT 50
    `, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            
            const localData = rows.map(row => ({
                time: new Date(row.timestamp_utc * 1000).toLocaleString(),  // Convert UNIX timestamp to local time
                avgTemp: row.avgTemp,
                avgHumidity: row.avgHumidity
            }));
            res.json(localData);
        }
    });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
