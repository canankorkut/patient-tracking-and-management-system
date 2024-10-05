# Patient Tracking and Management System
This project is a web application where patients, doctors and admin users will track their records, appointments and medical reports.
## Features
- User login/registration operations
- View user profile information
- Adding, deleting, and updating patient information
- Adding, deleting, and updating doctor information
- Adding, deleting, and updating appointment information
- Adding, deleting, and updating medical reports
- File upload/download operations
- Notification system (when new laboratory results are uploaded or updated)
## Database Design
1. **Users**: `user_id`, `email`, `password`, `role`
2. **Patients**: `patient_id`, `user_id`, `first_name`, `last_name`, `date_of_birth`, `gender`, `phone_number`, `address`
3. **Doctors**: `doctor_id`, `user_id`, `first_name`, `last_name`, `specialization`, `hospital_affiliation`
4. **Admin**: `admin_id`, `user_id`, `first_name`, `last_name`
5. **Appointments**: `appontment_id`, `patient_id`, `appointment_date`, `appointment_time`
6. **Medical_reports**: `report_id`, `patient_id`, `doctor_id`, `admin_id`, `report_date`, `report_content`
7. **Lab_results**: `result_id`, `report_id`, `image_url`
8. **Notifications**: `notification_id`, `user_id`, `message`, `read`, `created_at`
## Screenshots
### Login Page
![login](https://github.com/user-attachments/assets/63c08155-db20-4618-aeae-3e48147fd5b9)
### Signup Page
![signup](https://github.com/user-attachments/assets/cc1c3319-86ed-4cbd-abd6-e8a40900e2c2)
### Patient Page
![patient](https://github.com/user-attachments/assets/e1b6c135-e96c-4a96-86a3-0c75a5b8993d)
### Doctor Page
![doctor](https://github.com/user-attachments/assets/17256a49-e282-46a7-a657-21b3e36997f0)
### Admin Page
![admin](https://github.com/user-attachments/assets/fe77fb82-9be7-42b5-b1fc-0eff5d49e869)
## Technologies Used
- **Node.js**: Backend
- **Express.js**: API
- **React.js**: Frontend
- **PostgreSQL**: Database
- **Faker.js**: Test data generation
- **Nodemon**: Automatic server restart during development
- **Firebase**: File storage and download operations
- **Multer**: Managing file upload processes
- **JWT(JSON Web Token)**: User authentication
## Installation
### Steps
1. Clone the repository:
  ```bash
  git clone https://github.com/canankorkut/patient-tracking-and-management-system.git
  ```
2. Navigate to the server directory and install the dependencies:
  ```bash
  cd server
  npm install
  ```
4. Create a database in PostgreSQL:
  ```bash
  CREATE DATABASE patient_managment;
  ```
5. Add your database connection details to the `.env` file:
  ```bash
  DB_USER=your_database_user
  DB_HOST=your_database_host
  DB_NAME=your_database_name
  DB_PASSWORD=your_database_password
  DB_PORT=5432

  JWT_SECRET=your_jwt_secret_key
  ```
7. Navigate to the client directory and install the dependencies:
```bash
  cd client
  npm install
```
9. Start both the frontend and backend:
  ```bash
  # For the server
  cd server
  npm run dev

  # For the client
  cd client
  npm start
  ```
  
