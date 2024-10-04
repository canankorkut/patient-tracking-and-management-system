const express = require('express');
const router = express.Router();
const pool = require('../database'); 

// List notifications
router.get('/', async (req, res) => {
    const { user_id } = req.query; 
    try {
        const result = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [user_id]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).send('Server error');
    }
});

// Add notification
router.post('/', async (req, res) => {
    const { user_id, message } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *',
            [user_id, message]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).send('Server error');
    }
});

// Update notification
router.put('/:id', async (req, res) => {
    const { id } = req.params; 
    const { read } = req.body; 

    try {
        const result = await pool.query(
            'UPDATE notifications SET read = $1 WHERE notification_id = $2 RETURNING *',
            [read, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Notification not found');
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;