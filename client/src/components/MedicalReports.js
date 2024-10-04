import React, { useState, useEffect } from 'react'
import axios from 'axios'
import PaginationComponent from './PaginationComponent'

function MedicalReports({reports, setReports, userRole}) {
  const [newReport, setNewReport] = useState({
    patient_id: userRole === 'patient' ? localStorage.getItem('patient_id') : '',
    doctor_id: userRole === 'doctor' ? localStorage.getItem('doctor_id') : '',
    report_date: '',
    diagnosis: '',
    treatment: '',
    admin_id: localStorage.getItem('admin_id'),
    image_url: ''
  })

  const [showAddModal, setShowAddModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [updateReport, setUpdateReport] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [reportToDelete, setReportToDelete] = useState(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [reportsPerPage] = useState(11)

  const indexOfLastReport = currentPage * reportsPerPage
  const indexOfFirstReport = indexOfLastReport - reportsPerPage
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport)

  const totalPages = Math.ceil(reports.length / reportsPerPage)

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber)

  const handleAddReport = () => {
    if (
      !newReport.patient_id ||
      !newReport.doctor_id ||
      !newReport.report_date ||
      !newReport.diagnosis ||
      !newReport.treatment ||
      !newReport.image_url
    ) {
      alert("Please fill in all fields.")
      return
    }

    console.log('New Report Data:', newReport)

    const reportData = {
      patient_id: newReport.patient_id,
      doctor_id: newReport.doctor_id,
      report_date: newReport.report_date,
      admin_id: newReport.admin_id,
      image_url: newReport.image_url,
      report_content: {
        diagnosis: newReport.diagnosis,
        treatment: newReport.treatment
      }
    }

    axios.post('/api/reports', reportData)
      .then(response => {
        console.log('Reports Data:', response.data)
        setShowAddModal(false)
        setReports(prevReports => [...prevReports, response.data])
        
      })
      .catch(error => {
        if (error.response && error.response.data) {
            console.error('Error adding report:', error.response.data)
        } else {
            console.error('Error adding report:', error.message)
        }
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setNewReport({ ...newReport, [name]: value })
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    const formData = new FormData()
    formData.append('image', file)
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Image url:', response.data.url)
      setNewReport((prevNewReport) => ({ ...prevNewReport, image_url: response.data.url }))
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  const handleUpdateClick = (report) => {
    setUpdateReport({
      report_id: report.report_id,
      patient_id: report.patient_id,
      doctor_id: userRole === 'doctor' ? localStorage.getItem('doctor_id') : report.doctor_id,
      report_date: report.report_date,
      diagnosis: report.report_content.diagnosis,
      treatment: report.report_content.treatment,
      image_url: report.image_url
  })
    setShowUpdateModal(true)
  }

  const handleUpdateReport = () => {
    console.log('Update Report Data:', updateReport)
    if (
      !updateReport.patient_id ||
      !updateReport.doctor_id ||
      !updateReport.report_date ||
      !updateReport.diagnosis ||
      !updateReport.treatment ||
      !updateReport.image_url
    ) 
    if (updateReport.image_url !== newReport.image_url) {
      alert("Please fill in all fields.")
      return
    }
    
    const reportContent = {
      diagnosis: updateReport.diagnosis,
      treatment: updateReport.treatment
    }

    axios.put(`/api/reports/${updateReport.report_id}`, {
      patient_id: updateReport.patient_id,
      doctor_id: updateReport.doctor_id,
      report_date: updateReport.report_date,
      report_content: reportContent,
      admin_id: localStorage.getItem('admin_id'),
      image_url: updateReport.image_url
    })
      .then(response => {
        setShowUpdateModal(false)
        console.log('Updated Reports Data:', response.data)
        setReports(prevReports => 
          prevReports.map(report => (report.report_id === updateReport.report_id ? response.data : report))
        )
      })
      .catch(error => {
        console.error('Error updating report:', error)
      })
  }

  const handleUpdateChange = (e) => {
    const { name, value } = e.target
    setUpdateReport(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUploadForUpdate = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Updated image URL:', response.data.url);
      setUpdateReport((prevUpdateReport) => ({ ...prevUpdateReport, image_url: response.data.url }));
    } catch (error) {
      console.error('Error uploading updated image:', error);
    }
  };

  const handleDeleteClick = (reportId) => {
    console.log("Report id:", reportId)
    setReportToDelete(reportId)
    setShowDeleteModal(true)
  }

  const handleDeleteReport = () => {
    axios.delete(`/api/reports/${reportToDelete}`)
      .then(() => {
        setReports(prevReports => 
          prevReports.filter(report => report.report_id !== reportToDelete)
        )
        setShowDeleteModal(false)
        setReportToDelete(null)
      })
      .catch(error => {
        console.error('Error deleting report:', error)
      })
  }

  const downloadImage = (url) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = url
          a.download = 'lab_result'
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
      })
      .catch(err => console.error('Download failed:', err))
  }

  useEffect(() => {
    if(userRole === 'doctor') {
      const doctorId = localStorage.getItem('doctor_id');
      if (doctorId) {
        axios.get(`/api/reports/doctor-reports`, { params: { doctor_id: doctorId } })
          .then(response => {
            setReports(response.data)
          })
          .catch(error => {
            console.error('Error fetching doctor reports:', error)
          })
      }
    }
  }, [])

  useEffect(() => {
      if(userRole === 'patient') {
        const patientId = localStorage.getItem('patient_id');
        if (patientId) {
          axios.get(`/api/reports/patient-reports`, { params: { patient_id: patientId } })
            .then(response => {
              setReports(response.data)
            })
            .catch(error => {
              console.error('Error fetching patient reports:', error)
            })
        }
      }
    }, [])


  return (
    <div className='p-4'>
      <div className='d-inline-block mb-4'>
        <button className='btn btn-outline-primary' onClick={() => setShowAddModal(true)}>
          Add Report
        </button>
      </div>

      {showAddModal && (
        <div className='modal fade show d-block' role='dialog'>
            <div className='modal-dialog'>
              <div className='modal-content'>
                <div className='modal-header d-flex justify-content-between'>
                  <h5 className='modal-title'>Add Report</h5>
                  <div className='close' onClick={() => setShowAddModal(false)} style={{ cursor: 'pointer' }}>
                    <span className='fs-2'>&times;</span>
                  </div> 
                </div>
                <div className='modal-body'>
                  <form>   
                    {userRole !== 'patient' && (
                      <div className='form-group mt-2 mb-3'>
                        <label className='mb-1'>Patient ID</label>
                        <input 
                          type='number'
                          className='form-control'
                          name='patient_id'
                          value={newReport.patient_id}
                          onChange={handleChange}
                        />
                      </div>
                    )}                  
                    { userRole !== 'doctor' && (
                      <div className='form-group mb-3'>
                        <label className='mb-1'>Doctor ID</label>
                        <input 
                          type='number'
                          className='form-control'
                          name='doctor_id'
                          value={newReport.doctor_id}
                          onChange={handleChange}
                        />
                      </div>
                    )}
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Report Date</label>
                      <input 
                        type='date'
                        className='form-control'
                        name='report_date'
                        value={newReport.report_date}
                        onChange={handleChange}
                      />
                    </div>
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Diagnosis</label>
                      <input 
                        type='text'
                        className='form-control'
                        name='diagnosis'
                        value={newReport.diagnosis}
                        onChange={handleChange}
                      />
                    </div>
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Treatment</label>
                      <input 
                        type='text'
                        className='form-control'
                        name='treatment'
                        value={newReport.treatment}
                        onChange={handleChange}
                      />
                    </div>
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Lab Result Image URL</label>
                      <input 
                        type='file'
                        className='form-control'
                        name='image_url'
                        onChange={handleImageUpload}
                      />
                    </div>
                  </form>
                </div>
                <div className='modal-footer'>
                  <button type='button' className='btn btn-secondary mb-2' onClick={() => setShowAddModal(false)}>
                    Close
                  </button>
                  <button type='button' className='btn btn-primary' onClick={handleAddReport}>
                    Add Report
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}

      {showUpdateModal && updateReport && (
        <div className='modal fade show d-block' role='dialog'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header d-flex justify-content-between'>
                <h5 className='modal-title'>Update Report</h5>
                <div className='close' onClick={() => setShowUpdateModal(false)} style={{ cursor: 'pointer' }}>
                  <span className='fs-2'>&times;</span>
                </div>
              </div>
              <div className='modal-body'>
                <form>
                  {userRole !== 'patient' && (
                    <div className='form-group mb-3 mt-2'>
                      <label className='mb-1'>Patient ID</label>
                      <input 
                        type='number'
                        className='form-control'
                        name='patient_id'
                        value={updateReport.patient_id}
                        onChange={handleUpdateChange}
                      />
                    </div>
                  )}
                  { userRole !== 'doctor' && (
                    <div className='form-group mb-3'>
                      <label className='mb-1'>Doctor ID</label>
                      <input 
                        type='number'
                        className='form-control'
                        name='doctor_id'
                        value={updateReport.doctor_id}
                        onChange={handleUpdateChange}
                      />
                    </div>
                  )}
                  <div className='form-group mb-3'>
                    <label className='mb-1'>Report Date</label>
                    <input 
                      type='date'
                      className='form-control'
                      name='report_date'
                      value={updateReport.report_date}
                      onChange={handleUpdateChange}
                    />
                  </div>
                  <div className='form-group mb-3'>
                    <label className='mb-1'>Diagnosis</label>
                    <input 
                      type='text'
                      className='form-control'
                      name='diagnosis'
                      value={updateReport.diagnosis}
                      onChange={handleUpdateChange}
                    />
                  </div>
                  <div className='form-group mb-3'>
                    <label className='mb-1'>Treatment</label>
                    <input 
                      type='text'
                      className='form-control'
                      name='treatment'
                      value={updateReport.treatment}
                      onChange={handleUpdateChange}
                    />
                  </div>
                  <div className='form-group mb-3'>
                    <label className='mb-1'>Lab Result Image</label>
                    <input 
                      type='file'
                      className='form-control'
                      name='image_url'
                      onChange={handleImageUploadForUpdate}
                    />
                  </div>
                </form>
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary mb-2' onClick={() => setShowUpdateModal(false)}>
                  Close
                </button>
                <button type='button' className='btn btn-primary' onClick={handleUpdateReport}>
                  Update Report
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
                <h5 className='modal-title'>Delete Report</h5>
                <div className='close' onClick={() => setShowDeleteModal(false)} style={{ cursor: 'pointer' }}>
                  <span className='fs-2'>&times;</span>
                </div>
              </div>
              <div className='modal-body mt-3 mb-3'>
                Are you sure you want to delete this report?
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary mb-2' onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type='button' className='btn btn-danger' onClick={handleDeleteReport}>
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
                  <th>Report ID</th>
                  {userRole !== 'patient' && (
                    <th>Patient ID</th>
                  )}
                  {userRole === 'doctor' && (
                    <>
                    <th>Patient First Name</th>
                    <th>Patient Last Name</th>
                    </>
                  )}
                  {userRole !== 'doctor' && (
                    <th>Doctor ID</th>
                  )}
                  {userRole === 'patient' && (
                    <>
                    <th>Doctor First Name</th>
                    <th>Doctor Last Name</th>
                    </>
                  )}
                  <th>Report Date</th>
                  <th>Diagnosis</th>
                  <th>Treatment</th>
                  <th>Lab Result</th>
                  <th>Actions</th>
              </tr>
          </thead>
          <tbody>
              {currentReports.map(report =>  (
                <tr key={report.report_id}>
                      <td>{report.report_id}</td>
                      {userRole !== 'patient' && (
                        <td>{report.patient_id}</td>
                      )}
                      {userRole === 'doctor' && (
                        <>
                        <td>{report.patient_first_name}</td>
                        <td>{report.patient_last_name}</td>
                        </>
                      )}
                      {userRole !== 'doctor' && (
                        <td>{report.doctor_id}</td>
                      )}
                      {userRole === 'patient' && (
                        <>
                        <td>{report.doctor_first_name}</td>
                        <td>{report.doctor_last_name}</td>
                        </>
                      )}
                      <td>{report.report_date}</td>
                      <td>{report.report_content.diagnosis}</td>
                      <td>{report.report_content.treatment}</td>
                      <td>
                          {report.image_url ? (
                              <a onClick={() => downloadImage(report.image_url)} className="ms-2">
                                <i className="fa-solid fa-download"></i>
                              </a>
                          ) : (
                              'No lab results'
                          )}
                      </td>
                      <td>
                        <div className='d-flex justify-content-center'>
                        <button type='button' className='btn btn-outline-secondary me-2' onClick={() => handleUpdateClick(report)}>Update</button>
                        <button type='button' className='btn btn-outline-danger' onClick={() => handleDeleteClick(report.report_id)}>Delete</button>
                        </div>
                      </td>
                </tr>   
              )
              )}
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

export default MedicalReports