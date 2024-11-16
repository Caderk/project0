const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

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
router.get('/', (req, res) => {
    res.json(items);
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
function broadcast(data) {
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
}

// Get item by ID
router.get('/:id', (req, res) => {
    const item = items.find(i => i.id === req.params.id); // Remove parseInt
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
});

// Create a new item
router.post('/', (req, res) => {

    // Check if the items array has reached its limit
    if (items.length >= 20) {
        return res.status(400).json({ message: 'Cannot add more than 20 items' });
    }

    const { error } = itemSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const item = {
        id: uuidv4(), // Generate a unique ID
        name: req.body.name
    };
    items.push(item);
    res.status(201).json(item);

    // Broadcast the updated items list
    broadcast(items);
});

// Update an existing item
router.put('/:id', (req, res) => {
    const item = items.find(i => i.id === req.params.id); // Remove parseInt
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Validate the request body using the schema
    const { error } = itemSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Check if the new name is the same as the existing one
    if (item.name === req.body.name) {
        return res.status(200).json({ message: 'No changes were made, name is already the same', item });
    }

    // Update the item name
    item.name = req.body.name;
    res.json(item);

    // Broadcast the updated items list
    broadcast(items);
});

// Delete an item
router.delete('/:id', (req, res) => {
    const itemIndex = items.findIndex(i => i.id === req.params.id); // Remove parseInt
    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found' });

    items.splice(itemIndex, 1);
    res.status(204).send();

    // Broadcast the updated items list
    broadcast(items);
});

module.exports = router;
