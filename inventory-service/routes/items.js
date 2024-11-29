const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');

// In-memory data store (for example purposes)
const items = [
    { id: uuidv4(), name: 'Item 1' },
    { id: uuidv4(), name: 'Item 2' }
];

// Validation schema
const itemSchema = Joi.object({
    name: Joi.string().min(3).max(32).required()
});

// Get all items
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM items');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching items', error: err.message });
    }
});

// Array to hold connected clients
const clients = [];

// SSE endpoint
router.get('/stream', (req, res) => {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Add client to the list
    clients.push(res);

    // Remove client when connection is closed
    req.on('close', () => {
        console.log('Client disconnected');
        clients.splice(clients.indexOf(res), 1);
    });
});

// Function to send updates to all clients
async function broadcast() {
    try {
        const result = await pool.query('SELECT * FROM items');
        const data = result.rows;
        clients.forEach(client => {
            client.write(`data: ${JSON.stringify(data)}\n\n`);
        });
    } catch (err) {
        console.error('Error broadcasting data', err);
    }
}

// Get item by ID
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM items WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Item not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching item', error: err.message });
    }
});

// Create a new item
router.post('/', async (req, res) => {
    try {
        // Check if the items count has reached its limit
        const countResult = await pool.query('SELECT COUNT(*) FROM items');
        if (parseInt(countResult.rows[0].count) >= 20) {
            return res.status(400).json({ message: 'Cannot add more than 20 items' });
        }

        const { error } = itemSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const id = uuidv4();
        const { name } = req.body;

        const insertResult = await pool.query(
            'INSERT INTO items (id, name) VALUES ($1, $2) RETURNING *',
            [id, name]
        );

        res.status(201).json(insertResult.rows[0]);

        // Broadcast the updated items list
        broadcast();
    } catch (err) {
        res.status(500).json({ message: 'Error creating item', error: err.message });
    }
});

// Update an existing item
router.put('/:id', async (req, res) => {
    try {
        const { error } = itemSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { name } = req.body;
        const updateResult = await pool.query(
            'UPDATE items SET name = $1 WHERE id = $2 RETURNING *',
            [name, req.params.id]
        );

        if (updateResult.rows.length === 0) return res.status(404).json({ message: 'Item not found' });

        res.json(updateResult.rows[0]);

        // Broadcast the updated items list
        broadcast();
    } catch (err) {
        res.status(500).json({ message: 'Error updating item', error: err.message });
    }
});

// Delete an item
router.delete('/:id', async (req, res) => {
    try {
        const deleteResult = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [
            req.params.id,
        ]);

        if (deleteResult.rows.length === 0) return res.status(404).json({ message: 'Item not found' });

        res.status(204).send();

        // Broadcast the updated items list
        broadcast();
    } catch (err) {
        res.status(500).json({ message: 'Error deleting item', error: err.message });
    }
});

module.exports = router;
