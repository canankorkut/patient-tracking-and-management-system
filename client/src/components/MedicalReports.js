import React, { useState } from 'react'
import axios from 'axios'
import PaginationComponent from './PaginationComponent'

function MedicalReports({reports, setReports}) {
  const [newReport, setNewReport] = useState({
    patient_id: '',
    doctor_id: '',
    report_date: '',
    diagnosis: '',
    treatment: '',
    admin_id: localStorage.getItem('admin_id'),
    image_url: ''
  })

  const [showAddModal, setShowAddModal] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [reportsPerPage] = useState(11)

  const indexOfLastReport = currentPage * reportsPerPage
  const indexOfFirstReport = indexOfLastReport - reportsPerPage
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport)

  const totalPages = Math.ceil(reports.length / reportsPerPage)

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber)

  const downloadImage = (url) => {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = url
            a.download = 'lab_result.png'
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
        })
        .catch(err => console.error('Download failed:', err))
  }

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
                        type='text'
                        className='form-control'
                        name='image_url'
                        value={newReport.image_url}
                        onChange={handleChange}
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
    
      <table className='table text-center'>
          <thead>
              <tr>
                  <th>Report ID</th>
                  <th>Patient ID</th>
                  <th>Doctor ID</th>
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
                      <td>{report.patient_id}</td>
                      <td>{report.doctor_id}</td>
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
                        <button type='button' className='btn btn-outline-secondary me-2'>Update</button>
                        <button type='button' className='btn btn-outline-danger'>Delete</button>
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