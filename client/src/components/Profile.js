import React, { useState, useEffect } from 'react'
import axios from 'axios'

function Profile({userRole}) {
  const [profile, setProfile] = useState(null)
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    if(token) {
      axios.get('/api/users/user', {headers: { Authorization: `Bearer ${token}`}})
          .then(response => {
            setProfile(response.data)
          })
          .catch(error => {
              console.error('Error fetching user information:', error)
          })
    }
  }, [])

  if (!profile) {
    return <div>Loading...</div>
  }

  const { email, role, roleDetails } = profile
  let first_name, last_name, specialization, hospital_affiliation, date_of_birth, gender, phone_number, address

  if (userRole === 'doctor') {
    first_name = roleDetails.first_name
    last_name = roleDetails.last_name
    specialization = roleDetails.specialization
    hospital_affiliation = roleDetails.hospital_affiliation
  } else if (userRole === 'patient') {
    first_name = roleDetails.first_name
    last_name = roleDetails.last_name
    date_of_birth = roleDetails.date_of_birth
    gender = roleDetails.gender
    phone_number = roleDetails.phone_number
    address = roleDetails.address
  }

  return (
    <div className="container d-flex justify-content-center align-items-center mt-4" >
      <div className="card p-3" style={{ width: '25rem' }}>
        <div className="card-body">
          <h2 className="card-title mb-3">Profile</h2>
          <p className="card-text">First Name: {first_name}</p>
          <p className="card-text">Last Name: {last_name}</p>
          <p className="card-text">Role: {role}</p>
          <p className="card-text">Email: {email}</p>
          { userRole === 'doctor' && (
            <>
            <p className="card-text">Department: {specialization}</p>
            <p className="card-text">Hospital: {hospital_affiliation}</p>
            </>
          )}
          { userRole === 'patient' && (
            <>
            <p className="card-text">Date of Birth: {date_of_birth}</p>
            <p className="card-text">Gender: {gender}</p>
            <p className="card-text">Phone Number: {phone_number}</p>
            <p className="card-text">Address: {address}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile