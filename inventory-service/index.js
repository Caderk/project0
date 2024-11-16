const express = require('express');
const morgan = require("morgan");
const cors = require('cors');  // Import the cors package
const app = express();
const HOST = process.env.HOST;
const PORT = process.env.PORT;
const path = require('path');

// Enable CORS for all origins (adjust this in production to specific origins)
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Morgan for http request logging
app.use(morgan('dev'));

// Importing routes
const items = require('./routes/items');
app.use('/items', items);

// Simple root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the inventory-service API',
        version: '1.0.0',
        documentation: `${HOST}/inventory-service/api-docs`
    });
});

// Simple status check endpoint
app.get('/status', (req, res) => {
    res.status(200).json({
        message: 'API is running',
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date()
    });
});

// Serve API documentation
app.get('/api-docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-docs.json'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    // In production, don't expose stack traces
    res.status(err.status || 500).json({
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on ${HOST}:${PORT}`);
});