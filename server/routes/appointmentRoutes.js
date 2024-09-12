const express = require('express');
const router = express.Router();
const pool = require('../database');

router.get('/hospitals', async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT hospital_affiliation FROM doctors');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/departments', async (req, res) => {
    const { hospital } = req.query;

    try {
        const result = await pool.query('SELECT DISTINCT specialization FROM doctors WHERE hospital_affiliation = $1', [hospital]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/doctors', async (req, res) => {
    const { hospital, specialization } = req.query;

    try {
        const result = await pool.query('SELECT doctor_id, first_name, last_name FROM doctors WHERE hospital_affiliation = $1 AND specialization = $2', [hospital, specialization]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/', async(req, res) => {
    const { patient_id } = req.query;

    try {
        const result = await pool.query(`
            SELECT a.appointment_id, a.appointment_date, a.appointment_time,
                   d.first_name AS doctor_first_name, d.last_name AS doctor_last_name,
                   d.specialization, d.hospital_affiliation
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.doctor_id
            WHERE a.patient_id = $1    
        `, [patient_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error'});
    }
});

// Create an appointment
router.post('/', async (req, res) => {
    const { appointment_date, appointment_time, doctor_id, patient_id } = req.body;

    try {
        const patientCheck = await pool.query('SELECT * FROM patients WHERE patient_id = $1', [patient_id]);

        if (patientCheck.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid Patient ID' });
        }

        const result = await pool.query(`
            INSERT INTO appointments (appointment_date, appointment_time, doctor_id, patient_id)
            VALUES ($1, $2, $3, $4) RETURNING appointment_id
        `, [appointment_date, appointment_time, doctor_id, patient_id]);

        const appointmentId = result.rows[0].appointment_id;

        const appointmentResult = await pool.query(`
            SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.doctor_id,
                   d.first_name AS doctor_first_name, d.last_name AS doctor_last_name,
                   d.specialization, d.hospital_affiliation
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.doctor_id
            WHERE a.appointment_id = $1
        `, [appointmentId]);

        res.status(201).json(appointmentResult.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update appointment
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { appointment_date, appointment_time, doctor_id } = req.body;

    const setClause = [];
    const values = [];
    let paramIndex = 1;

    if (appointment_date) {
        setClause.push(`appointment_date = $${paramIndex}`);
        values.push(appointment_date);
        paramIndex++;
    }
    if (appointment_time) {
        setClause.push(`appointment_time = $${paramIndex}`);
        values.push(appointment_time);
        paramIndex++;
    }
    if (doctor_id) {
        setClause.push(`doctor_id = $${paramIndex}`);
        values.push(doctor_id);
        paramIndex++;
    }

    if (setClause.length === 0) {
        return res.status(400).json({ error: 'There are no fields to update' });
    }

    const query = `
      UPDATE appointments
      SET ${setClause.join(', ')}
      WHERE appointment_id = $${paramIndex}
      RETURNING *;
    `;

    values.push(id);

    try {
        const result = await pool.query(query, values);

        // Get updated appointment information
        const appointmentResult = await pool.query(`
            SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.doctor_id,
                   d.first_name AS doctor_first_name, d.last_name AS doctor_last_name,
                   d.specialization, d.hospital_affiliation
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.doctor_id
            WHERE a.appointment_id = $1
        `, [id]);

        res.json(appointmentResult.rows[0]);
    } catch (error) {
        console.error('An error occurred while updating the appointment:', error);
        res.status(500).send('An error occurred while updating the appointment.');
    }
});

// Delete an appointment
router.delete('/:id', (req, res) => {
    const { id } = req.params;
  
    const query = 'DELETE FROM appointments WHERE appointment_id = $1 RETURNING *;';
    
    pool.query(query, [id])
      .then(result => {
        if (result.rowCount > 0) {
          res.status(204).send();
        } else {
          res.status(404).send('Appointment not found');
        }
      })
      .catch(error => {
        console.error('Error deleting appointment:', error);
        res.status(500).send('Error deleting appointment');
      });
});

module.exports = router;