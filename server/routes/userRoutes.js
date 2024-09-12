const express = require('express');
const router = express.Router();
const pool = require('../database');
const jwt = require('jsonwebtoken');

router.get('/user', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user_id;

        // Get user information
        const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        // Get role-specific details
        let roleDetails = {};
        if (user.role === 'patient') {
            const patientResult = await pool.query('SELECT * FROM patients WHERE user_id = $1', [userId]);
            roleDetails = patientResult.rows[0] || {};
        } else if (user.role === 'doctor') {
            const doctorResult = await pool.query('SELECT * FROM doctors WHERE user_id = $1', [userId]);
            roleDetails = doctorResult.rows[0] || {};
        } else if (user.role === 'admin') {
            const adminResult = await pool.query('SELECT * FROM admin WHERE user_id = $1', [userId]);
            roleDetails = adminResult.rows[0] || {};
        }

        res.json({ ...user, roleDetails });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;