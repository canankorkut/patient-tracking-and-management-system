import React, { useState } from 'react'
import PaginationComponent from './PaginationComponent'

function MedicalReports({reports, setReports}) {

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
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'lab_result.png';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(err => console.error('Download failed:', err));
  };

  return (
    <div className='p-4'>
      <div className='d-inline-block mb-4'>
        <button className='btn btn-outline-primary'>
          Add Report
        </button>
      </div>
    
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