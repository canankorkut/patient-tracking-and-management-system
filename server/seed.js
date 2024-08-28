const { faker } = require('@faker-js/faker');
const { Pool } = require('pg');
const pool = require('./database');

// Random data insertion functions
async function seedData() {
    try {
        // To track similar email addresses, create a Set
        const emailSet = new Set();

        // Add 5000 users 
        for (let i = 0; i < 5000; i++) {
            let email;
            do {
                email = faker.internet.email();
            } while (emailSet.has(email));

            emailSet.add(email);
            const password = faker.internet.password();
            const role = faker.helpers.arrayElement(['patient', 'doctor', 'admin']);

            await pool.query(
                'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING user_id',
                [email, password, role]
            );
        }

        // To track used user IDs, create a Set.
        const usedUserIds = new Set();

        // Add 1000 doctors
        for(let i = 0; i < 1000; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const specialization = faker.helpers.arrayElement([
                'Internal Medicine', 'Pediatrics', 'Orthopedic Surgery', 'General Surgery', 'Plastic and Reconstructive Surgery', 'Thoracic Surgery', 'Neurosurgery',
                'Cardiovascular Surgery', 'Obstetrics and Gynecology', 'Otolaryngology', 'Ophthalmology', 'Neurology', 'Radiology', 'Psychiatry', 'Dermatology', 'Cardiology', 'Urology'
            ]);
            const hospitalAffiliation = faker.company.name();
            
            let userId;
            do {
                const userIdResult = await pool.query('SELECT user_id FROM users WHERE role = $1 ORDER BY RANDOM() LIMIT 1', ['doctor']);
                userId = userIdResult.rows[0].user_id;
            } while (usedUserIds.has(userId));

            usedUserIds.add(userId);

            await pool.query(
                'INSERT INTO doctors (user_id, first_name, last_name, specialization, hospital_affiliation) VALUES ($1, $2, $3, $4, $5)',
                [userId, firstName, lastName, specialization, hospitalAffiliation]
            );
        }

        // Add 1000 patients
        for (let i = 0; i < 1000; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const dateOfBirth = faker.date.between({ from: '1940-01-01', to: Date.now() }).toISOString().split('T')[0];
            const gender = faker.helpers.arrayElement(['Male', 'Female']);
            const phoneNumber = faker.phone.number();
            const address = faker.location.streetAddress();
            
            let userId;
            do {
                const userIdResult = await pool.query('SELECT user_id FROM users WHERE role = $1 ORDER BY RANDOM() LIMIT 1', ['patient']);
                userId = userIdResult.rows[0].user_id;
            } while (usedUserIds.has(userId));

            usedUserIds.add(userId);

            await pool.query(
                'INSERT INTO patients (user_id, first_name, last_name, date_of_birth, gender, phone_number, address) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [userId, firstName, lastName, dateOfBirth, gender, phoneNumber, address]
            );
        }

        // Add 10 admins
        for (let i = 0; i < 10; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            
            let userId;
            do {
                const userIdResult = await pool.query('SELECT user_id FROM users WHERE role = $1 ORDER BY RANDOM() LIMIT 1', ['admin']);
                userId = userIdResult.rows[0].user_id;
            } while (usedUserIds.has(userId));

            usedUserIds.add(userId);

            await pool.query(
                'INSERT INTO admin (user_id, first_name, last_name) VALUES ($1, $2, $3)',
                [userId, firstName, lastName]
            );
        }

        // Add 1000 appointments
        for(let i = 0; i < 1000; i++) {
            const patientIdResult = await pool.query('SELECT patient_id FROM patients ORDER BY RANDOM() LIMIT 1');
            const doctorIdResult = await pool.query('SELECT doctor_id FROM doctors ORDER BY RANDOM() LIMIT 1');

            const patientId = patientIdResult.rows[0].patient_id;
            const doctorId = doctorIdResult.rows[0].doctor_id;
            const appointmentDate = faker.date.future().toISOString().split('T')[0];
            
            const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0');
            const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
            const appointmentTime = `${hours}:${minutes}`;

            await pool.query(
                'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time) VALUES ($1, $2, $3, $4)',
                [patientId, doctorId, appointmentDate, appointmentTime]
            );
        }

        // Add 1000 medical reports
        for (let i = 0; i < 1000; i++) {
            const patientIdResult = await pool.query('SELECT patient_id FROM patients ORDER BY RANDOM() LIMIT 1');
            const doctorIdResult = await pool.query('SELECT doctor_id FROM doctors ORDER BY RANDOM() LIMIT 1');
            const adminIdResult = await pool.query('SELECT admin_id FROM admin ORDER BY RANDOM() LIMIT 1');

            const patientId = patientIdResult.rows[0].patient_id;
            const doctorId = doctorIdResult.rows[0].doctor_id;
            const adminId = adminIdResult.rows[0].admin_id;
            const reportDate = faker.date.past().toISOString().split('T')[0];
            const reportContent = JSON.stringify({details: faker.lorem.paragraph() });
            const imageURL = faker.image.url();

            await pool.query(
                'INSERT INTO medical_reports (patient_id, doctor_id, admin_id, report_date, report_content, image_url) VALUES ($1, $2, $3, $4, $5, $6)',
                [patientId, doctorId, adminId, reportDate, reportContent, imageURL]
            );
        }

        console.log('Random data has been added successfully.');
        
    } catch (err) {
        console.error('An error occurred while adding data: ', err);
    }
} 

seedData();