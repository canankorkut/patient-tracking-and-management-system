const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../database');

// User registration
exports.signup = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *',
            [email, hashedPassword, role]
        );
        res.json(newUser.rows[0])
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// User input
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(401).send('Invalid credentials');
        };

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).send('Invalid credentials');
        };

        const token = jwt.sign({ user_id: user.rows[0].user_id }, process.env.JWT_SECRET, { expiresIn: '1h'});
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};