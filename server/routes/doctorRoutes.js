const express = require('express');
const router = express.Router();
const pool = require('../database');
const authenticateToken = require('../middlewares/authenticateToken');

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

module.exports = router;