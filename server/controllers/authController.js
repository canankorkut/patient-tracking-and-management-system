const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../database');

exports.signup = async (req, res) => {
    const { email, password, role, firstName, lastName, dateOfBirth, gender, phoneNumber, address, specialization, hospitalAffiliation } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUserResult = await pool.query(
            'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING user_id',
            [email, hashedPassword, role]
        );
        const userId = newUserResult.rows[0].user_id;

        if (role === 'patient') {
            await pool.query(
                'INSERT INTO patients (user_id, first_name, last_name, date_of_birth, gender, phone_number, address) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [userId, firstName, lastName, dateOfBirth, gender, phoneNumber, address]
            );
        } else if (role === 'doctor') {
            await pool.query(
                'INSERT INTO doctors (user_id, first_name, last_name, specialization, hospital_affiliation) VALUES ($1, $2, $3, $4, $5)',
                [userId, firstName, lastName, specialization, hospitalAffiliation]
            );
        } else if (role === 'admin') {
            await pool.query(
                'INSERT INTO admin (user_id, first_name, last_name) VALUES ($1, $2, $3)',
                [userId, firstName, lastName]
            );
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' }); 
        }

        const user = userResult.rows[0];

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' }); 
        }

        const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        let roleDetails = {};
        if (user.role === 'patient') {
            const patientResult = await pool.query('SELECT * FROM patients WHERE user_id = $1', [user.user_id]);
            if (patientResult.rows.length > 0) {
                roleDetails = patientResult.rows[0];
            } else {
                console.error('Patient details not found for user_id:', user.user_id);
            }
        } else if (user.role === 'doctor') {
            const doctorResult = await pool.query('SELECT * FROM doctors WHERE user_id = $1', [user.user_id]);
            roleDetails = doctorResult.rows[0] || {};
        } else if (user.role === 'admin') {
            const adminResult = await pool.query('SELECT * FROM admin WHERE user_id = $1', [user.user_id]);
            roleDetails = adminResult.rows[0] || {};
        }

        res.json({ token, role: user.role, roleDetails }); 
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' }); 
    
    }
};