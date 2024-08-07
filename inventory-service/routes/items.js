const express = require('express');
const router = express.Router();
const Joi = require('joi');

// In-memory data store (for example purposes)
let items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
];

// Validation schema
const itemSchema = Joi.object({
    name: Joi.string().min(3).required()
});

// Get all items
router.get('/', (req, res) => {
    res.json(items);
});

// Get item by ID
router.get('/:id', (req, res) => {
    const item = items.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
});

// Create a new item
router.post('/', (req, res) => {
    const { error } = itemSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const item = {
        id: items.length + 1,
        name: req.body.name
    };
    items.push(item);
    res.status(201).json(item);
});

// Update an existing item
router.put('/:id', (req, res) => {
    const item = items.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const { error } = itemSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    item.name = req.body.name;
    res.json(item);
});

// Delete an item
router.delete('/:id', (req, res) => {
    const itemIndex = items.findIndex(i => i.id === parseInt(req.params.id));
    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found' });

    items.splice(itemIndex, 1);
    res.status(204).send();
});

module.exports = router;
