const express = require('express');
const router = express.Router();
const pool = require('../database');
const authenticateToken = require('../middlewares/authenticateToken');

router.get('/:id', authenticateToken, async(req, res) => {
    const { id } = req.params;
    const { user } = req;

    try {
        if(user.role === 'patient' && user.user_id !== parseInt(id)) {
            return res.status(403).json({ message: 'Access denied: Unauthorized'});
        }
        
        const result = await pool.query('SELECT * FROM patients WHERE patient_id = $1', [id]);
        if(result.rows.length === 0) {
            return res.status(404).json({message: 'Patient not found'});
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error'});
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM patients');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', async (req, res) => {
    const {email, password, role, first_name, last_name, date_of_birth, gender, phone_number, address} = req.body;

    try {
        const userResult = await pool.query(
            `INSERT INTO users (email, password, role) 
             VALUES ($1, $2, $3) RETURNING user_id`,
            [email, password, role]
        );

        const user_id = userResult.rows[0].user_id;

        const patientResult = await pool.query(
            `INSERT INTO patients (user_id, first_name, last_name, date_of_birth, gender, phone_number, address)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [user_id, first_name, last_name, date_of_birth, gender, phone_number, address]
        );

        res.status(201).json(patientResult.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});
module.exports = router;