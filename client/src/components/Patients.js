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
                <button type='button' className='btn btn-outline-secondary me-2' >Update</button>
                <button type='button' className='btn btn-outline-danger' >Delete</button>
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