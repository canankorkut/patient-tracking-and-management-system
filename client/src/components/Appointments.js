import React, { useState, useEffect } from 'react'
import axios from 'axios'
import PaginationComponent from './PaginationComponent'

function Appointments({ appointments, setAppointments, userRole }) {
  const [newAppointment, setNewAppointment] = useState({
    hospital: '',
    department: '',
    appointment_date: '',
    appointment_time: '',
    doctor_id: '',
    patient_id: localStorage.getItem('patient_id')
  })

  const [showModal, setShowModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [updateAppointment, setUpdateAppointment] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState(null)
  const [hospitals, setHospitals] = useState([])
  const [departments, setDepartments] = useState([])
  const [doctors, setDoctors] = useState([])

  const [selectedHospital, setSelectedHospital] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const [appointmentsPerPage] = useState(11)

  const indexOfLastAppointment = currentPage * appointmentsPerPage
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment)

  const totalPages = Math.ceil(appointments.length / appointmentsPerPage)

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber)

  useEffect(() => {
    axios.get('/api/appointments/hospitals')
      .then(response => setHospitals(response.data))
      .catch(error => console.error('Error fetching hospitals:', error))
  }, []);

  const handleHospitalChange = (e) => {
    const hospital = e.target.value
    setSelectedHospital(hospital)
    setNewAppointment(prev => ({ ...prev, hospital }))
  
    axios.get('/api/appointments/departments', { params: { hospital } })
      .then(response => setDepartments(response.data))
      .catch(error => console.error('Error fetching departments:', error))
  
    if (updateAppointment) {
      setUpdateAppointment(prev => ({ ...prev, hospital }))
  
      axios.get('/api/appointments/departments', { params: { hospital } })
        .then(response => setDepartments(response.data))
        .catch(error => console.error('Error fetching departments:', error))
    }
  }

  const handleDepartmentChange = (e) => {
    const department = e.target.value
    setSelectedDepartment(department)
    setNewAppointment(prev => ({ ...prev, department }))
  
    axios.get('/api/appointments/doctors', { params: { hospital: selectedHospital, specialization: department } })
      .then(response => setDoctors(response.data))
      .catch(error => console.error('Error fetching doctors:', error))
  
    if (updateAppointment) {
      setUpdateAppointment(prev => ({ ...prev, department }))
  
      axios.get('/api/appointments/doctors', { params: { hospital: selectedHospital, specialization: department } })
        .then(response => setDoctors(response.data))
        .catch(error => console.error('Error fetching doctors:', error))
    }
  }

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value
    console.log('Selected Doctor ID:', doctorId)
  
    setNewAppointment(prev => ({
      ...prev,
      doctor_id: doctorId
    }))
  
    if (updateAppointment) {
      setUpdateAppointment(prev => ({ ...prev, doctor_id: doctorId }))
    }
  }

  const handleAddAppointment = () => {
    if (
      !newAppointment.hospital ||
      !newAppointment.department ||
      !newAppointment.appointment_date ||
      !newAppointment.appointment_time ||
      !newAppointment.doctor_id ||
      !newAppointment.patient_id
    ) {
      alert("Please fill in all fields.")
      return
    }

    console.log('New Appointment Data:', newAppointment)
    axios.post('/api/appointments', newAppointment)
      .then(response => {
        console.log('Appointments Data:', response.data)
        setShowModal(false)
        setAppointments(prevAppointments => [...prevAppointments, response.data])
        
      })
      .catch(error => {
        if (error.response && error.response.data) {
            console.error('Error adding appointment:', error.response.data)
        } else {
            console.error('Error adding appointment:', error.message)
        }
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewAppointment({ ...newAppointment, [name]: value })
  }

  const handleDeleteClick = (appointmentId) => {
    console.log("Appontment id:", appointmentId)
    setAppointmentToDelete(appointmentId)
    setShowDeleteModal(true)
  }

  const handleDeleteAppointment = () => {
    axios.delete(`/api/appointments/${appointmentToDelete}`)
      .then(() => {
        setAppointments(prevAppointments => 
          prevAppointments.filter(appointment => appointment.appointment_id !== appointmentToDelete)
        )
        setShowDeleteModal(false)
        setAppointmentToDelete(null)
      })
      .catch(error => {
        console.error('Error deleting appointment:', error)
      })
  }

  const handleUpdateClick = (appointment) => {
    console.log(appointment)
    setUpdateAppointment(appointment)
    
    setShowUpdateModal(true)
  }

  const handleUpdateAppointment = () => {
    console.log('Update Appointment Data:', updateAppointment)
    if (!updateAppointment || !updateAppointment.appointment_id) {
      console.error('Appointment ID is missing.')
      return
    }

    axios.put(`/api/appointments/${updateAppointment.appointment_id}`, updateAppointment)
      .then(response => {
        setShowUpdateModal(false)
        console.log('Updated Appointments Data:', response.data)
        setAppointments(prevAppointments => 
          prevAppointments.map(app => (app.appointment_id === updateAppointment.appointment_id ? response.data : app))
        )
      })
      .catch(error => {
        console.error('Error updating appointment:', error)
      })
  }

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target
   
    setUpdateAppointment(prev => ({ ...prev, [name]: value }))
  }
  
  useEffect(() => {
    if(userRole === 'doctor') {
      const doctorId = localStorage.getItem('doctor_id');
      if (doctorId) {
        axios.get(`/api/appointments/doctor-appointments`, { params: { doctor_id: doctorId } })
          .then(response => {
            setAppointments(response.data)
          })
          .catch(error => {
            console.error('Error fetching doctor appointments:', error)
          })
      }
    }
  }, [])
  
  return (
    <div className='p-4'>
      <div className='d-inline-block mb-4'>
        { userRole === 'patient' && (
          <button className='btn btn-outline-primary' onClick={() => setShowModal(true)}>
            Add Appointment
          </button>
        )}
      </div>

      {showModal && userRole === 'patient' && (
        <div className='modal fade show d-block' role='dialog'>
            <div className='modal-dialog'>
              <div className='modal-content'>
                <div className='modal-header d-flex justify-content-between'>
                  <h5 className='modal-title'>Add Appointment</h5>
                  <div className='close' onClick={() => setShowModal(false)} style={{ cursor: 'pointer' }}>
                    <span className='fs-2'>&times;</span>
                  </div> 
                </div>
                <div className='modal-body'>
                  <form>
                    <div className='form-group mb-3 mt-2'>
                      <label className='mb-1'>Hospital</label>
                      <select className='form-control'name='hospital' onChange={handleHospitalChange}>
                        <option value=''>Select Hospital</option>
                        {hospitals.map(hospital => (
                          <option key={hospital.hospital_affiliation}  value={hospital.hospital_affiliation}>
                            {hospital.hospital_affiliation}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Department</label>
                      <select className='form-control' name='department' onChange={handleDepartmentChange} disabled={!selectedHospital}>
                        <option value=''>Select Department</option>
                        {departments.map(department => (
                          <option key={department.specialization}  value={department.specialization}>
                            {department.specialization}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Doctor</label>
                      <select className='form-control' name='doctor_name' onChange={handleDoctorChange} disabled={!selectedDepartment}>
                        <option value=''>Select Doctor</option>
                        {doctors.map(doctor => (
                          <option key={doctor.doctor_id}  value={doctor.doctor_id}>
                            {`${doctor.first_name} ${doctor.last_name}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Appointment Date</label>
                      <input 
                        type='date'
                        className='form-control'
                        name='appointment_date'
                        value={newAppointment.appointment_date}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Appointment Time</label>
                      <input 
                        type='time'
                        className='form-control'
                        name='appointment_time'
                        value={newAppointment.appointment_time}
                        onChange={handleInputChange}
                      />
                    </div>
                  </form>
                </div>
                <div className='modal-footer'>
                  <button type='button' className='btn btn-secondary mb-2' onClick={() => setShowModal(false)}>
                    Close
                  </button>
                  <button type='button' className='btn btn-primary' onClick={handleAddAppointment}>
                    Add Appointment
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}

      {showDeleteModal && (
        <div className='modal fade show d-block' role='dialog'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header d-flex justify-content-between'>
                <h5 className='modal-title'>Delete Appointment</h5>
                <div className='close' onClick={() => setShowDeleteModal(false)} style={{ cursor: 'pointer' }}>
                  <span className='fs-2'>&times;</span>
                </div>
              </div>
              <div className='modal-body mt-3 mb-3'>
                Are you sure you want to delete this appointment?
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary mb-2' onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type='button' className='btn btn-danger' onClick={handleDeleteAppointment}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpdateModal && updateAppointment && (
        <div className='modal fade show d-block' role='dialog'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header d-flex justify-content-between'>
                <h5 className='modal-title'>Update Appointment</h5>
                <div className='close' onClick={() => setShowUpdateModal(false)} style={{ cursor: 'pointer' }}>
                  <span className='fs-2'>&times;</span>
                </div>
              </div>
              <div className='modal-body'>
                <form>
                  { userRole === 'patient' && (
                    <><div className='form-group mb-3 mt-2'>
                      <label className='mb-1'>Hospital</label>
                      <select className='form-control' name='hospital' onChange={handleHospitalChange}>
                        <option value=''>Select Hospital</option>
                        {hospitals.map(hospital => (
                          <option key={hospital.hospital_affiliation} value={hospital.hospital_affiliation}>
                            {hospital.hospital_affiliation}
                          </option>
                        ))}
                      </select>
                    </div><div className='form-group mb-3'>
                        <label className='mb-1'>Department</label>
                        <select className='form-control' name='department' onChange={handleDepartmentChange} disabled={!selectedHospital}>
                          <option value=''>Select Department</option>
                          {departments.map(department => (
                            <option key={department.specialization} value={department.specialization}>
                              {department.specialization}
                            </option>
                          ))}
                        </select>
                      </div><div className='form-group mb-3'>
                        <label className='mb-1'>Doctor</label>
                        <select className='form-control' name='doctor_id' onChange={handleDoctorChange} disabled={!selectedDepartment}>
                          <option value=''>Select Doctor</option>
                          {doctors.map(doctor => (
                            <option key={doctor.doctor_id} value={doctor.doctor_id}>
                              {`${doctor.first_name} ${doctor.last_name}`}
                            </option>
                          ))}
                        </select>
                      </div></>
                  )}
                  <div className='form-group mb-3'>
                    <label className='mb-1'>Appointment Date</label>
                    <input 
                      type='date'
                      className='form-control'
                      name='appointment_date'
                      value={updateAppointment.appointment_date}
                      onChange={handleUpdateInputChange}
                    />
                  </div>
                  <div className='form-group mb-3'>
                    <label className='mb-1'>Appointment Time</label>
                    <input 
                      type='time'
                      className='form-control'
                      name='appointment_time'
                      value={updateAppointment.appointment_time}
                      onChange={handleUpdateInputChange}
                    />
                  </div>
                </form>
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary mb-2' onClick={() => setShowUpdateModal(false)}>
                  Close
                </button>
                <button type='button' className='btn btn-primary' onClick={handleUpdateAppointment}>
                  Update Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <table className='table text-center'>
        <thead>
          <tr>
            <th scope='col'>Appointment ID</th>
            { userRole === 'patient' && (
              <>
              <th scope='col'>Doctor Name</th>
              <th scope='col'>Department</th>
              <th scope='col'>Hospital</th>
              </>
            )}
            { userRole === 'doctor' && (
              <>
              <th scope='col'>Patient First Name</th>
              <th scope='col'>Patient Last Name</th>
              </>
            )}
            <th scope='col'>Appointment Date</th>
            <th scope='col'>Appointment Time</th>
            <th scope='col'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentAppointments.map(appointment => (
            <tr key={appointment.appointment_id}>
              <td>{appointment.appointment_id}</td>
              {userRole === 'patient' && (
                <>
                <td>{`${appointment.doctor_first_name} ${appointment.doctor_last_name}`}</td>
                <td>{appointment.specialization}</td>
                <td>{appointment.hospital_affiliation}</td>
                </>
              )}
              {userRole === 'doctor' && (
                <>
                <td>{appointment.patient_first_name}</td>
                <td>{appointment.patient_last_name}</td>
                </>
              )}
              <td>{appointment.appointment_date}</td>
              <td>{appointment.appointment_time}</td>
              <td>
                <div className='d-flex justify-content-center'>
                <button type='button' className='btn btn-outline-secondary me-2' onClick={() => handleUpdateClick(appointment)}>Update</button>
                <button type='button' className='btn btn-outline-danger' onClick={() => handleDeleteClick(appointment.appointment_id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <PaginationComponent 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={handlePageChange} 
      />
    </div>
  )
}

export default Appointments