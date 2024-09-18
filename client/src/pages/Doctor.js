import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Patients from '../components/Patients'
import MedicalReports from '../components/MedicalReports'
import logo from '../assets/logo.png'
import '../styles/Patient.css'

function Doctor() {
    const [patients, setPatients] = useState([])
    const [reports, setReports] = useState([])
    const [activeTab, setActiveTab] = useState('patients')
    const navigate = useNavigate()
    const doctorId = localStorage.getItem('doctor_id')

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
        if(doctorId) {
            axios.get(`/api/doctors/${doctorId}/patients`)
                .then(patientsResponse => {
                    setPatients(patientsResponse.data)
                })
                .catch(error => {
                    console.error('Error fetching patients:', error)
                })

            axios.get(`/api/reports?doctor_id=${doctorId}`)
                .then(reportsResponse => {
                    setReports(reportsResponse.data)
                })
                .catch(error => {
                    console.error('Error fetching medical reports:', error)
                })
        }
    }, [doctorId])

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
                                className={`btn btn-outline-primary w-100 mb-2 mt-4 ${activeTab === 'patients' ? 'active' : ''}`}
                                onClick={() => setActiveTab('patients')}
                            >
                                <i className='fa-solid fa-wheelchair me-2'></i>
                                Patients
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
                            Doctor
                        </div>
                    </div>

                    {activeTab === 'patients' ? (
                        <Patients patients={patients}/>
                    ) : (
                        <MedicalReports reports={reports} />
                    )}
                </main>
            </div>
        </div>
  )
}

export default Doctor