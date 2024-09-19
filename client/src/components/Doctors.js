import React, {useState, useEffect} from 'react'
import axios from 'axios'
import PaginationComponent from './PaginationComponent'

function Doctors({doctors, setDoctors}) {
  const [newDoctor, setNewDoctor] = useState({
    email: '',
    password: '',
    role: 'doctor',
    first_name: '',
    last_name: '',
    specialization: '',
    hospital_affiliation: '',
    admin_id: localStorage.getItem('admin_id')
  })

  const [showAddModal, setShowAddModal] = useState(false)
  const [updateDoctor, setUpdateDoctor] = useState(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [hospitals, setHospitals] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedHospital, setSelectedHospital] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const [doctorsPerPage] = useState(11)

  const indexOfLastDoctor = currentPage * doctorsPerPage
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage
  const currentDoctors = doctors.slice(indexOfFirstDoctor, indexOfLastDoctor)

  const totalPages = Math.ceil(doctors.length / doctorsPerPage)

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber)

  const handleAddDoctor = () => {
    if (
      !newDoctor.email ||
      !newDoctor.password ||
      !newDoctor.first_name ||
      !newDoctor.last_name ||
      !newDoctor.specialization ||
      !newDoctor.hospital_affiliation
    ) {
      alert("Please fill in all fields.")
      return
    }

    console.log('New Doctor Data:', newDoctor)
    axios.post('/api/doctors', newDoctor)
      .then(response => {
        console.log('Doctors Data:', response.data)
        setShowAddModal(false)
        setDoctors(prevDoctors => [...prevDoctors, response.data])
        
      })
      .catch(error => {
        if (error.response && error.response.data) {
            console.error('Error adding doctor:', error.response.data)
        } else {
            console.error('Error adding doctor:', error.message)
        }
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewDoctor({ ...newDoctor, [name]: value })
  }

  useEffect(() => {
    axios.get('/api/doctors')
      .then(response => {
        const doctors = response.data
        setDoctors(doctors)
        
        const hospitalsList = [...new Set(doctors.map(doctor => doctor.hospital_affiliation))]
        setHospitals(hospitalsList)
      })
      .catch(error => console.error('Error fetching doctors:', error))
  }, [setDoctors])

  const handleHospitalChange = (e) => {
    const selectedHospital = e.target.value
    setNewDoctor(prev => ({ ...prev, hospital_affiliation: selectedHospital }))
  
    setSelectedHospital(selectedHospital);
  
    const filteredDepartments = [...new Set(doctors
      .filter(doctor => doctor.hospital_affiliation === selectedHospital)
      .map(doctor => doctor.specialization))]
    
    setDepartments(filteredDepartments)
  };
  
  const handleDepartmentChange = (e) => {
    const department = e.target.value;
  
    setNewDoctor(prev => ({ ...prev, specialization: department }))
  
    if (updateDoctor) {
      setUpdateDoctor(prev => ({ ...prev, specialization: department }))
    }
  }

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target
    
    setUpdateDoctor(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdateClick = (doctor) => {
    setUpdateDoctor(doctor)
    setShowUpdateModal(true)
  }

  const handleUpdateDoctor = () => {
    console.log('Update Doctor Data:', updateDoctor)
    if (!updateDoctor || !updateDoctor.doctor_id) {
      console.error('Doctor ID is missing.')
      return
    }

    axios.put(`/api/doctors/${updateDoctor.doctor_id}`, {
      ...updateDoctor,
      hospital_affiliation: selectedHospital,
      specialization: updateDoctor.specialization
    })
      .then(response => {
        setShowUpdateModal(false)
        console.log('Updated Doctors Data:', response.data)
        setDoctors(prevDoctors => 
          prevDoctors.map(app => (app.doctor_id === updateDoctor.doctor_id ? response.data : app))
        )
      })
      .catch(error => {
        console.error('Error updating doctor:', error)
      })
  }

  return (
    <div className='p-4'>
      <div className='d-inline-block mb-4'>
        <button className='btn btn-outline-primary'  onClick={() => setShowAddModal(true)}>
          Add Doctor
        </button>
      </div>

      {showAddModal && (
        <div className='modal fade show d-block' role='dialog'>
            <div className='modal-dialog'>
              <div className='modal-content'>
                <div className='modal-header d-flex justify-content-between'>
                  <h5 className='modal-title'>Add Doctor</h5>
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
                        value={newDoctor.first_name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Last Name</label>
                      <input
                        type='text'
                        className='form-control'
                        name='last_name'
                        value={newDoctor.last_name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Email</label>
                      <input
                        type='email'
                        className='form-control'
                        name='email'
                        value={newDoctor.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Password</label>
                      <input
                        type='password'
                        className='form-control'
                        name='password'
                        value={newDoctor.password}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className='form-group mb-3 mt-2'>
                      <label className='mb-1'>Hospital</label>
                      <select className='form-control'name='hospital' onChange={handleHospitalChange}>
                        <option value=''>Select Hospital</option>
                        {hospitals.map(hospital => (
                          <option key={hospital}  value={hospital}>
                            {hospital}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Department</label>
                      <select className='form-control' name='department' onChange={handleDepartmentChange} disabled={!selectedHospital}>
                        <option value=''>Select Department</option>
                        {departments.map(department => (
                          <option key={department}  value={department}>
                            {department}
                          </option>
                        ))}
                      </select>
                    </div>
                  </form>
                </div>
                <div className='modal-footer'>
                  <button type='button' className='btn btn-secondary mb-2' onClick={() => setShowAddModal(false)}>
                    Close
                  </button>
                  <button type='button' className='btn btn-primary' onClick={handleAddDoctor}>
                    Add Doctor
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}

      {showUpdateModal && updateDoctor && (
        <div className='modal fade show d-block' role='dialog'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header d-flex justify-content-between'>
                <h5 className='modal-title'>Update Doctor</h5>
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
                      value={updateDoctor.first_name}
                      onChange={handleUpdateInputChange}
                    />
                  </div>
                  <div className='form-group mb-3'>
                    <label className='mb-1'>Last Name</label>
                    <input
                      type='text'
                      className='form-control'
                      name='last_name'
                      value={updateDoctor.last_name}
                      onChange={handleUpdateInputChange}
                    />
                  </div>
                  <div className='form-group mb-3 mt-2'>
                    <label className='mb-1'>Hospital</label>
                    <select className='form-control'name='hospital' onChange={handleHospitalChange}>
                      <option value=''>Select Hospital</option>
                      {hospitals.map(hospital => (
                        <option key={hospital}  value={hospital}>
                          {hospital}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='form-group mb-3'>
                    <label className='mb-1'>Department</label>
                    <select className='form-control' name='department' onChange={handleDepartmentChange} disabled={!selectedHospital}>
                      <option value=''>Select Department</option>
                      {departments.map(department => (
                        <option key={department}  value={department}>
                          {department}
                        </option>
                      ))}
                    </select>
                  </div>  
                </form>
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary mb-2' onClick={() => setShowUpdateModal(false)}>
                  Close
                </button>
                <button type='button' className='btn btn-primary' onClick={handleUpdateDoctor}>
                  Update Doctor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <table className='table text-center'>
        <thead>
          <tr>
            <th>Doctor ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Department</th>
            <th>Hospital</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentDoctors.map(doctor => (
            <tr key={doctor.doctor_id}>
              <td>{doctor.doctor_id}</td>
              <td>{doctor.first_name}</td>
              <td>{doctor.last_name}</td>
              <td>{doctor.specialization}</td>
              <td>{doctor.hospital_affiliation}</td>
              <td>
                <div className='d-flex'>
                <button type='button' className='btn btn-outline-secondary me-2' onClick={() => handleUpdateClick(doctor)}>Update</button>
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

export default Doctors