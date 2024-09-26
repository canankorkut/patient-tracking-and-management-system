const express = require('express');
const router = express.Router();
const pool = require('../database');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT mr.*, lr.image_url 
            FROM medical_reports mr
            LEFT JOIN lab_results lr ON mr.report_id = lr.report_id
            ORDER BY mr.report_id ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;