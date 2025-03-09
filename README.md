# MQTT Weather Station

A simple web application that receives temperature and humidity data via MQTT, stores it in SQLite, and visualizes real-time graphs.

## Features

1.Receives temperature & humidity data from MQT
2.Stores data in an SQLite database
3.Provides a REST API for 5-minute average data
5.Displays real-time graphs with Chart.js

## Setup Instructions

1.Clone the repository:

git clone https://github.com/hope-ndinda/mqtt_weather_monitoring.git
cd mqtt_weather_monitoring

2.Install dependencies:

npm install express sqlite3 mqtt cors

3.Start the backend:

node server.js

3.Open index.html in a browser or serve it using:

npx http-server .

