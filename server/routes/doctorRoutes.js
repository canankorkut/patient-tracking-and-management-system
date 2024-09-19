const express = require('express');
const router = express.Router();
const pool = require('../database');
const authenticateToken = require('../middlewares/authenticateToken');
const bcrypt = require('bcrypt');

router.get('/:id', authenticateToken, async(req, res) => {
    const { id } = req.params;
    const { user } = req;

    try {
        if(user.role === 'doctor' && user.user_id !== parseInt(id)) {
            return res.status(403).json({ message: 'Access denied: Unauthorized'});
        }
        
        const result = await pool.query('SELECT * FROM doctors WHERE doctor_id = $1', [id]);
        if(result.rows.length === 0) {
            return res.status(404).json({message: 'Doctor not found'});
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error'});
    }
});

router.get('/:id/patients', authenticateToken, async(req, res) => {
    const { id } = req.params;
    const { user } = req;

    try {
        if(user.role === 'doctor') {
            return res.status(403).json({ message: 'Access denied: Unauthorized' });
        }
        
        const result = await pool.query(`
            SELECT p.*
            FROM patients p
            JOIN appointments a ON p.patient_id = a.patient_id
            WHERE a.doctor_id = $1
        `, [id]);

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM doctors');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', async (req, res) => {
    const {email, password, role, first_name, last_name, specialization, hospital_affiliation} = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userResult = await pool.query(
            `INSERT INTO users (email, password, role) 
             VALUES ($1, $2, $3) RETURNING user_id`,
            [email, hashedPassword, role]
        );

        const user_id = userResult.rows[0].user_id;

        const doctorResult = await pool.query(
            `INSERT INTO doctors (user_id, first_name, last_name, specialization, hospital_affiliation)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [user_id, first_name, last_name, specialization, hospital_affiliation]
        );

        res.status(201).json(doctorResult.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, specialization, hospital_affiliation } = req.body;

    try {
        const result = await pool.query(
            `UPDATE doctors SET first_name = $1, last_name = $2, specialization = $3, hospital_affiliation = $4
             WHERE doctor_id = $5 RETURNING *`,
            [first_name, last_name, specialization, hospital_affiliation, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;