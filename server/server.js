const express = require("express");
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const {Pool} = require('pg');
const pool = require("./database");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const reportRoutes = require("./routes/reportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const admin = require("firebase-admin");
const serviceAccount = require('../firebase-service-account.json');
const multer = require("multer");

const app = express();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "patient-management-syste-4682a.appspot.com"
});

const bucket = admin.storage().bucket();

const upload = multer({
    storage: multer.memoryStorage(),
    fields: [
        { name: 'report_id', maxCount: 1},
    ],
});

app.post('/api/upload', upload.single('image'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const blob = bucket.file(file.originalname);
    const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
    });

    blobStream.on('error', (err) => {
        res.status(500).send(err);
    });

    blobStream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        
        try {    
            const result = await pool.query(
                'UPDATE lab_results SET image_url = $1 WHERE report_id = $2',
                [publicUrl, req.body.report_id]
            );
            res.status(200).send({
                message: 'File uploaded successfully',
                url: publicUrl,
                labResult: result.rows[0], 
            });
        } catch (err) {
            console.error('Error inserting into lab_results:', err);
            res.status(500).send('Error saving the image URL to the database');
        }
    });

    blobStream.end(file.buffer);
});

app.use(express.json());
app.use(cors());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

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