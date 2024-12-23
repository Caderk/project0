// Import environment variables
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "production";

// Import express
const express = require("express");
const app = express();

// Use Express Middleware to parse JSON
app.use(express.json());

// Use Morgan for http request logging
const morgan = require("morgan");
app.use(morgan("dev"));

// Importing additional routes
const items = require("./routes/items");
app.use("/items", items);

// Simple root endpoint
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to the inventory-service API",
        version: "1.0.0",
        documentation: `/api-docs`,
    });
});

// Simple status check endpoint
app.get("/status", (req, res) => {
    res.status(200).json({
        message: "API is running",
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date(),
    });
});

// Simple API documentation endpoint
const path = require("path");
app.get("/api-docs", (req, res) => {
    res.sendFile(path.join(__dirname, "api-docs.json"));
});

// Error handling middleware
app.use((err, req, res, next) => {
    // In production, don't expose stack traces
    res.status(err.status || 500).json({
        message: err.message,
        error: NODE_ENV === "development" ? err : {},
    });
});

// Start listening for requests
app.listen(PORT, () => {
    console.log(`Inventory Service is running on ${HOST}:${PORT}`);
});
