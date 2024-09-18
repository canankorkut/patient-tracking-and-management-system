import React, {useState} from 'react'
import axios from 'axios'
import PaginationComponent from './PaginationComponent'

function Patients({patients, setPatients}) {
  const [newPatient, setNewPatient] = useState({
    email: '',
    password: '',
    role: 'patient',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    address: '',
    admin_id: localStorage.getItem('admin_id')
  })

  const [showAddModal, setShowAddModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [updatePatient, setUpdatePatient] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [patientsPerPage] = useState(11)

  const indexOfLastPatient = currentPage * patientsPerPage
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage
  const currentPatients = patients.slice(indexOfFirstPatient, indexOfLastPatient)

  const totalPages = Math.ceil(patients.length / patientsPerPage)

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber)

  const handleAddPatient = () => {
    if (
      !newPatient.email ||
      !newPatient.password ||
      !newPatient.first_name ||
      !newPatient.last_name ||
      !newPatient.date_of_birth ||
      !newPatient.gender ||
      !newPatient.phone_number ||
      !newPatient.address
    ) {
      alert("Please fill in all fields.")
      return
    }

    console.log('New Patient Data:', newPatient)
    axios.post('/api/patients', newPatient)
      .then(response => {
        console.log('Patients Data:', response.data)
        setShowAddModal(false)
        setPatients(prevPatients => [...prevPatients, response.data])
        
      })
      .catch(error => {
        if (error.response && error.response.data) {
            console.error('Error adding patient:', error.response.data)
        } else {
            console.error('Error adding patient:', error.message)
        }
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewPatient({ ...newPatient, [name]: value })
  }

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target
    
    setUpdatePatient(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdateClick = (patient) => {
    setUpdatePatient(patient)
    setShowUpdateModal(true)
  }

  const handleUpdatePatient = () => {
    console.log('Update Patient Data:', updatePatient)
    if (!updatePatient || !updatePatient.patient_id) {
      console.error('Patient ID is missing.')
      return
    }

    axios.put(`/api/patients/${updatePatient.patient_id}`, updatePatient)
      .then(response => {
        setShowUpdateModal(false)
        console.log('Updated Patients Data:', response.data)
        setPatients(prevPatients => 
          prevPatients.map(app => (app.patient_id === updatePatient.patient_id ? response.data : app))
        )
      })
      .catch(error => {
        console.error('Error updating patient:', error)
      })
  }

  const handleDeleteClick = (patientId) => {
    console.log("Patient id:", patientId)
    setPatientToDelete(patientId)
    setShowDeleteModal(true)
  }

  const handleDeletePatient = () => {
    axios.delete(`/api/patients/${patientToDelete}`)
      .then(() => {
        setPatients(prevPatients => 
          prevPatients.filter(patient => patient.patient_id !== patientToDelete)
        )
        setShowDeleteModal(false)
        setPatientToDelete(null)
      })
      .catch(error => {
        console.error('Error deleting patient:', error)
      })
  }
  
  return (
    <div className='p-4'>
      <div className='d-inline-block mb-4'>
        <button className='btn btn-outline-primary'  onClick={() => setShowAddModal(true)}>
          Add Patient
        </button>
      </div>

      {showAddModal && (
        <div className='modal fade show d-block' role='dialog'>
            <div className='modal-dialog'>
              <div className='modal-content'>
                <div className='modal-header d-flex justify-content-between'>
                  <h5 className='modal-title'>Add Patient</h5>
                  <div className='close' onClick={() => setShowAddModal(false)} style={{ cursor: 'pointer' }}>
                    <span className='fs-2'>&times;</span>
                  </div> 
                </div>
                <div className='modal-body'>
                  <form>
                    <div className='form-group mb-3 mt-2'>
                        <label className='mb-1'>First Name</label>
                        <input
                          type='text'
                          className='form-control'
                          name='first_name'
                          value={newPatient.first_name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className='form-group mb-3'>
                        <label className='mb-1'>Last Name</label>
                        <input
                          type='text'
                          className='form-control'
                          name='last_name'
                          value={newPatient.last_name}
                          onChange={handleInputChange}
                        />
                      </div>
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Email</label>
                      <input
                        type='email'
                        className='form-control'
                        name='email'
                        value={newPatient.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Password</label>
                      <input
                        type='password'
                        className='form-control'
                        name='password'
                        value={newPatient.password}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Date of Birth</label>
                      <input
                        type='date'
                        className='form-control'
                        name='date_of_birth'
                        value={newPatient.date_of_birth}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Gender</label>
                      <select
                        className='form-control'
                        name='gender'
                        value={newPatient.gender}
                        onChange={handleInputChange}
                      >
                        <option value=''>Select Gender</option>
                        <option value='Male'>Male</option>
                        <option value='Female'>Female</option>
                      </select>
                    </div>
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Phone Number</label>
                      <input
                        type='text'
                        className='form-control'
                        name='phone_number'
                        value={newPatient.phone_number}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Address</label>
                      <input 
                        type='text'
                        className='form-control'
                        name='address'
                        value={newPatient.address}
                        onChange={handleInputChange}
                      />
                    </div>
                  </form>
                </div>
                <div className='modal-footer'>
                  <button type='button' className='btn btn-secondary mb-2' onClick={() => setShowAddModal(false)}>
                    Close
                  </button>
                  <button type='button' className='btn btn-primary' onClick={handleAddPatient}>
                    Add Patient
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}

      {showUpdateModal && updatePatient && (
        <div className='modal fade show d-block' role='dialog'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header d-flex justify-content-between'>
                <h5 className='modal-title'>Update Patient</h5>
                <div className='close' onClick={() => setShowUpdateModal(false)} style={{ cursor: 'pointer' }}>
                  <span className='fs-2'>&times;</span>
                </div>
              </div>
              <div className='modal-body'>
                <form>
                  <div className='form-group mb-3 mt-2'>
                    <label className='mb-1'>First Name</label>
                    <input
                      type='text'
                      className='form-control'
                      name='first_name'
                      value={updatePatient.first_name}
                      onChange={handleUpdateInputChange}
                    />
                  </div>
                  <div className='form-group mb-3'>
                    <label className='mb-1'>Last Name</label>
                    <input
                      type='text'
                      className='form-control'
                      name='last_name'
                      value={updatePatient.last_name}
                      onChange={handleUpdateInputChange}
                    />
                  </div>
                  <div className='form-group mb-3'>
                    <label className='mb-1'>Date of Birth</label>
                    <input
                      type='date'
                      className='form-control'
                      name='date_of_birth'
                      value={updatePatient.date_of_birth}
                      onChange={handleUpdateInputChange}
                    />
                  </div>
                  <div className='form-group mb-3'>
                    <label className='mb-1'>Gender</label>
                    <select
                      className='form-control'
                      name='gender'
                      value={updatePatient.gender}
                      onChange={handleUpdateInputChange}
                    >
                      <option value=''>Select Gender</option>
                      <option value='Male'>Male</option>
                      <option value='Female'>Female</option>
                    </select>
                  </div>
                  <div className='form-group mb-3'>
                    <label className='mb-1'>Phone Number</label>
                    <input
                      type='text'
                      className='form-control'
                      name='phone_number'
                      value={updatePatient.phone_number}
                      onChange={handleUpdateInputChange}
                    />
                  </div>
                  <div className='form-group mb-3'>
                    <label className='mb-1'>Address</label>
                    <input 
                      type='text'
                      className='form-control'
                      name='address'
                      value={updatePatient.address}
                      onChange={handleUpdateInputChange}
                    />
                  </div>
                </form>
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary mb-2' onClick={() => setShowUpdateModal(false)}>
                  Close
                </button>
                <button type='button' className='btn btn-primary' onClick={handleUpdatePatient}>
                  Update Patient
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
                <h5 className='modal-title'>Delete Patient</h5>
                <div className='close' onClick={() => setShowDeleteModal(false)} style={{ cursor: 'pointer' }}>
                  <span className='fs-2'>&times;</span>
                </div>
              </div>
              <div className='modal-body mt-3 mb-3'>
                Are you sure you want to delete this patient?
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary mb-2' onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type='button' className='btn btn-danger' onClick={handleDeletePatient}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <table className='table text-center'>
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Date of Birth</th>
            <th>Gender</th>
            <th>Phone Number</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPatients.map(patient => (
            <tr key={patient.patient_id}>
              <td>{patient.patient_id}</td>
              <td>{patient.first_name}</td>
              <td>{patient.last_name}</td>
              <td>{patient.date_of_birth}</td>
              <td>{patient.gender}</td>
              <td>{patient.phone_number}</td>
              <td>{patient.address}</td>
              <td>
                <div className='d-flex'>
                <button type='button' className='btn btn-outline-secondary me-2' onClick={() => handleUpdateClick(patient)}>Update</button>
                <button type='button' className='btn btn-outline-danger' onClick={() => handleDeleteClick(patient.patient_id)}>Delete</button>
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

export default Patients