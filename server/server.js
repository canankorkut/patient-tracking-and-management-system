const express = require("express");
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const {Pool} = require('pg');
const pool = require("./database");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);


const createTables = fs.readFileSync(path.join(__dirname, 'migrations', 'create_tables.sql'), 'utf-8');

pool.query(createTables)
    .then(result => {
        console.log('Tables successfully created.');
    })
    .catch(err => {
        console.error('An error occurred while creating tables: ', err);
    });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});