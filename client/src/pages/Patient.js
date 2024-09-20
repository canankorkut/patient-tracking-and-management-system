import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Appointments from '../components/Appointments'
import MedicalReports from '../components/MedicalReports'
import logo from '../assets/logo.png'
import '../styles/Patient.css'

function Patient() {
    const [appointments, setAppointments] = useState([])
    const [reports, setReports] = useState([])
    const [activeTab, setActiveTab] = useState('appointments')
    const navigate = useNavigate()
    const patientId = localStorage.getItem('patient_id')

    useEffect(() => {
        const token = localStorage.getItem('token')

        if(token) {
            axios.get('/api/users/user', {headers: { Authorization: `Bearer ${token}`}})
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error('Error fetching user information:', error)
                })
        }
    }, [])

    useEffect(() => {
        if(patientId) {
            axios.get(`/api/appointments?patient_id=${patientId}`)
                .then(appointmentsResponse => {
                    setAppointments(appointmentsResponse.data)
                })
                .catch(error => {
                    console.error('Error fetching appointments:', error)
                })

            axios.get(`/api/reports?patient_id=${patientId}`)
                .then(reportsResponse => {
                    setReports(reportsResponse.data)
                })
                .catch(error => {
                    console.error('Error fetching medical reports:', error)
                })
        }
    }, [patientId])

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <div className='container-fluid'>
            <div className='row'>
                <nav className='sidebar col-md-3 col-lg-2 p-3 d-flex flex-column'>
                        <div className='d-flex flex-column align-items-center'>
                            <img src={logo} alt='Logo' className='logo-sidebar mb-4' />
                            <button
                                className={`btn btn-outline-primary w-100 mb-2 mt-4 ${activeTab === 'appointments' ? 'active' : ''}`}
                                onClick={() => setActiveTab('appointments')}
                            >
                                <i className='fa-solid fa-calendar-days me-2'></i>
                                Appointments
                            </button>
                            <button
                                className={`btn btn-outline-primary w-100 mt-2 ${activeTab === 'reports' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reports')}
                            >
                                <i className='fa-solid fa-file-medical me-2'></i>
                                Medical Reports
                            </button>
                        </div>
                        <button
                            className='btn btn-outline-danger w-100 mb-3'
                            onClick={handleLogout}
                        >
                            <i className='fa-solid fa-right-from-bracket me-2'></i>
                            Logout
                        </button>
                </nav>

                <main className='col-md-9 col-lg-10 bg-light p-4'>
                    <div className='d-flex justify-content-end mb-3 me-4'>
                        <div className='notification me-4'>
                            <i className='fa-regular fa-bell'></i>
                        </div>
                        <div className='profile'>
                            <i className='fa-regular fa-user me-2'></i>
                            Patient
                        </div>
                    </div>

                    {activeTab === 'appointments' ? (
                        <Appointments appointments={appointments} setAppointments={setAppointments} userRole={'patient'}/>
                    ) : (
                        <MedicalReports reports={reports} />
                    )}
                </main>
            </div>
        </div>
  )
}

export default Patient