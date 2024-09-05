const express = require('express');
const router = express.Router();
const pool = require('../database');

router.get('/', async(req, res) => {
    const { patient_id } = req.query;

    try {
        const result = await pool.query('SELECT * FROM medical_reports WHERE patient_id = $1', [patient_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error'});
    }
});

module.exports = router;