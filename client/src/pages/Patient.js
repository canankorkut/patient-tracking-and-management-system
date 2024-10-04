import React, { useState, useEffect, act } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Appointments from '../components/Appointments'
import MedicalReports from '../components/MedicalReports'
import Profile from '../components/Profile'
import Notifications from '../components/Notifications'
import logo from '../assets/logo.png'
import '../styles/Patient.css'

function Patient() {
    const [appointments, setAppointments] = useState([])
    const [reports, setReports] = useState([])
    const [notifications, setNotifications] = useState([])
    const [activeTab, setActiveTab] = useState('appointments')
    const [patientName, setPatientName] = useState('')
    const navigate = useNavigate()
    const patientId = localStorage.getItem('patient_id')

    useEffect(() => {
        const token = localStorage.getItem('token')

        if(token) {
            axios.get('/api/users/user', {headers: { Authorization: `Bearer ${token}`}})
                .then(response => {
                    console.log(response.data)
                    const { first_name, last_name } = response.data.roleDetails
                    setPatientName(`${first_name} ${last_name}`)
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
            
            axios.get(`/api/notifications?user_id=${patientId}`)
                .then(notificationsResponse => {
                    setNotifications(notificationsResponse.data)
                })
                .catch(error => {
                    console.error('Error fetching notifications:', error)
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
                            <button
                                className={`btn btn-outline-primary w-100 mt-3 ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <i className='fa-solid fa-user me-2'></i>
                                Profile
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
                        <div className="notification me-4" data-bs-toggle="modal" data-bs-target="#notificationModal">
                            <i className="fa-regular fa-bell fa-lg"></i>
                            {notifications.filter(notification => !notification.read).length > 0 && (
                                <span className="badge bg-danger">{notifications.filter(notification => !notification.read).length}</span>
                            )}
                        </div>
                        <div className='profile'>
                            <i className='fa-regular fa-user me-2'></i>
                            {patientName}
                        </div>
                    </div>

                    {activeTab === 'appointments' && (
                        <Appointments appointments={appointments} setAppointments={setAppointments} userRole={'patient'}/>
                    )}
                    {activeTab === 'reports' && (
                        <MedicalReports reports={reports} setReports={setReports} userRole={'patient'}/>
                    )}
                    {activeTab === 'profile' && (
                        <Profile userRole={'patient'}/>
                    )} 
                </main>

                <Notifications notifications={notifications} setNotifications={setNotifications} />
            </div>
        </div>
  )
}

export default Patient