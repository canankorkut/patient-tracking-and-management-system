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

        // Add 100 medical reports
        for (let i = 0; i < 100; i++) {
            const patientIdResult = await pool.query('SELECT patient_id FROM patients ORDER BY RANDOM() LIMIT 1');
            const doctorIdResult = await pool.query('SELECT doctor_id, specialization FROM doctors ORDER BY RANDOM() LIMIT 1');
            const adminIdResult = await pool.query('SELECT admin_id FROM admin ORDER BY RANDOM() LIMIT 1');

            const patientId = patientIdResult.rows[0].patient_id;
            const doctorId = doctorIdResult.rows[0].doctor_id;
            const adminId = adminIdResult.rows[0].admin_id;
            const specialization = doctorIdResult.rows[0].specialization;
            const reportDate = faker.date.past().toISOString().split('T')[0];

            let diagnosis, treatment;
            switch (specialization) {
                case 'Internal Medicine':
                    diagnosis = faker.helpers.arrayElement(['Hypertension', 'Diabetes', 'Anemia']);
                    treatment = faker.helpers.arrayElement(['Medication', 'Diet Control', 'Regular Monitoring']);
                    break;
                case 'Pediatrics':
                    diagnosis = faker.helpers.arrayElement(['Asthma', 'Bronchitis', 'Growth Issues']);
                    treatment = faker.helpers.arrayElement(['Inhaler Therapy', 'Pediatric Care', 'Regular Checkups']);
                    break;
                case 'Orthopedic Surgery':
                    diagnosis = faker.helpers.arrayElement(['Fracture', 'Dislocation', 'Arthritis']);
                    treatment = faker.helpers.arrayElement(['Surgery', 'Physical Therapy', 'Medication']);
                    break;
                case 'Cardiology':
                    diagnosis = faker.helpers.arrayElement(['Coronary Artery Disease', 'Heart Failure', 'Arrhythmia']);
                    treatment = faker.helpers.arrayElement(['Angioplasty', 'Bypass Surgery', 'Medication']);
                    break;
                case 'Neurology':
                    diagnosis = faker.helpers.arrayElement(['Migraine', 'Epilepsy', 'Multiple Sclerosis']);
                    treatment = faker.helpers.arrayElement(['Medication', 'Physical Therapy', 'Surgical Intervention']);
                    break;
                case 'Dermatology':
                    diagnosis = faker.helpers.arrayElement(['Acne', 'Psoriasis', 'Eczema']);
                    treatment = faker.helpers.arrayElement(['Topical Cream', 'Oral Medication', 'Laser Treatment']);
                    break;
                case 'Psychiatry':
                    diagnosis = faker.helpers.arrayElement(['Depression', 'Anxiety', 'Bipolar Disorder']);
                    treatment = faker.helpers.arrayElement(['Therapy', 'Medication', 'Cognitive Behavioral Therapy']);
                    break;
                default:
                    diagnosis = faker.helpers.arrayElement(['General Checkup']);
                    treatment = faker.helpers.arrayElement(['Monitoring', 'Regular Care']);
            }

            const reportContent = JSON.stringify({
                diagnosis: diagnosis,
                treatment: treatment,
            });

            await pool.query(
                'INSERT INTO medical_reports (patient_id, doctor_id, admin_id, report_date, report_content) VALUES ($1, $2, $3, $4, $5)',
                [patientId, doctorId, adminId, reportDate, reportContent]
            );
        }

        // Add 100 lab results
        for (let i = 0; i < 100; i++) {
            const reportResult = await pool.query('SELECT report_id, report_content FROM medical_reports ORDER BY RANDOM() LIMIT 1');
            const reportId = reportResult.rows[0].report_id;
            const reportContent = reportResult.rows[0].report_content;
            const diagnosis = reportContent.diagnosis;

            let labResult, imageUrl;
            switch (diagnosis) {
                case 'Hypertension':
                case 'Diabetes':
                case 'Anemia':
                    labResult = 'Blood Test';
                    imageUrl = 'https://images.unsplash.com/photo-1576086631093-32b333463801?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
                    break;
                case 'Asthma':
                case 'Bronchitis':
                case 'Growth Issues':
                    labResult = 'Spirometry';
                    imageUrl = 'https://plus.unsplash.com/premium_photo-1716679813868-9d7e3b4532d2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
                    break;
                case 'Fracture':
                case 'Dislocation':
                case 'Arthritis':
                    labResult = 'X-Ray';
                    imageUrl = 'https://plus.unsplash.com/premium_photo-1658506655357-8713cf0c6b69?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
                    break;
                case 'Coronary Artery Disease':
                case 'Heart Failure':
                case 'Arrhythmia':
                    labResult = 'ECG';
                    imageUrl = 'https://plus.unsplash.com/premium_photo-1663011454840-48f5fffb737b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
                    break;
                case 'Migraine':
                case 'Epilepsy':
                case 'Multiple Sclerosis':
                    labResult = 'MRI';
                    imageUrl = 'https://plus.unsplash.com/premium_photo-1661856238614-bfacddd4eae1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
                    break;
                case 'Acne':
                case 'Psoriasis':
                case 'Eczema':
                    labResult = 'Skin Scraping';
                    imageUrl = 'https://plus.unsplash.com/premium_photo-1723568476206-3fa0341247df?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
                    break;
                case 'Depression':
                case 'Anxiety':
                case 'Bipolar Disorder':
                    labResult = 'Psychological Evaluation';
                    imageUrl = 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
                    break;
                default:
                    labResult = 'General Checkup';
                    imageUrl = 'https://plus.unsplash.com/premium_photo-1661715352607-6da4f682730b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
            }

            await pool.query(
                'INSERT INTO lab_results (report_id, image_url) VALUES ($1, $2)',
                [reportId, imageUrl]
            );

        }

        console.log('Random data has been added successfully.');
        
    } catch (err) {
        console.error('An error occurred while adding data: ', err);
    }
} 

seedData();