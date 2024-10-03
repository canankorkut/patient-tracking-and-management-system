const express = require('express');
const router = express.Router();
const pool = require('../database');

// List reports
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

// Add report
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
            SELECT mr.*, lr.image_url, p.first_name AS patient_first_name, p.last_name AS patient_last_name 
            FROM medical_reports mr
            LEFT JOIN lab_results lr ON mr.report_id = lr.report_id
            INNER JOIN patients p ON mr.patient_id = p.patient_id
            WHERE mr.report_id = $1;
        `, [reportId]);

        res.json(fullReport.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update report
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { patient_id, doctor_id, report_date, report_content, admin_id, image_url } = req.body;

    try {
        // Update medical_reports table
        const updatedReport = await pool.query(`
            UPDATE medical_reports
            SET patient_id = $1, doctor_id = $2, report_date = $3, report_content = $4::json, admin_id = $5
            WHERE report_id = $6
            RETURNING *;
        `, [patient_id, doctor_id, report_date, JSON.stringify(report_content), admin_id, id]);

        // If image_url exists, update lab_results table
        if (image_url) {
            const existingLabResult = await pool.query(`
                SELECT * FROM lab_results WHERE report_id = $1;
            `, [id]);

            if (existingLabResult.rows.length > 0) {
                // Update existing lab result
                await pool.query(`
                    UPDATE lab_results
                    SET image_url = $1
                    WHERE report_id = $2;
                `, [image_url, id]);
            } else {
                // If there is no lab_result for this report_id, add a new one
                await pool.query(`
                    INSERT INTO lab_results (report_id, image_url)
                    VALUES ($1, $2);
                `, [id, image_url]);
            }
        }

        // Return fully updated report
        const fullReport = await pool.query(`
            SELECT mr.*, lr.image_url, p.first_name AS patient_first_name, p.last_name AS patient_last_name 
            FROM medical_reports mr
            INNER JOIN patients p ON mr.patient_id = p.patient_id
            LEFT JOIN lab_results lr ON mr.report_id = lr.report_id
            WHERE mr.report_id = $1;
        `, [id]);

        res.json(fullReport.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete report
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Delete record from lab_results table
        await pool.query(`
            DELETE FROM lab_results WHERE report_id = $1;
        `, [id]);

        // Delete record from medical_reports table
        await pool.query(`
            DELETE FROM medical_reports WHERE report_id = $1;
        `, [id]);

        res.json({ message: 'Report deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get doctor's reports
router.get('/doctor-reports', async (req, res) => {
    const { doctor_id } = req.query;

    try {
        const result = await pool.query(`
            SELECT mr.*, lr.image_url, p.first_name AS patient_first_name, p.last_name AS patient_last_name 
            FROM medical_reports mr
            LEFT JOIN lab_results lr ON mr.report_id = lr.report_id
            INNER JOIN patients p ON mr.patient_id = p.patient_id
            WHERE mr.doctor_id = $1;
        `, [doctor_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No report found.' });
        }
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;