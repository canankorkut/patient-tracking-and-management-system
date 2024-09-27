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

router.post('/', async (req, res) => {
    const { patient_id, doctor_id, report_date, report_content, admin_id, image_url } = req.body;

    try {
        const newReport = await pool.query(`
            INSERT INTO medical_reports (patient_id, doctor_id, report_date, report_content, admin_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `, [patient_id, doctor_id, report_date, report_content, admin_id]);

        const reportId = newReport.rows[0].report_id;

        if (image_url) {
            await pool.query(`
                INSERT INTO lab_results (report_id, image_url)
                VALUES ($1, $2);
            `, [reportId, image_url]);
        }

        const fullReport = await pool.query(`
            SELECT mr.*, lr.image_url 
            FROM medical_reports mr
            LEFT JOIN lab_results lr ON mr.report_id = lr.report_id
            WHERE mr.report_id = $1;
        `, [reportId]);

        res.json(fullReport.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;