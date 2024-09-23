import React, { useState, useEffect } from 'react'
import axios from 'axios'

function Profile() {
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
  const { first_name, last_name, specialization, hospital_affiliation } = roleDetails

  return (
    <div className="container d-flex justify-content-center align-items-center mt-4" >
      <div className="card p-3" style={{ width: '25rem' }}>
        <div className="card-body">
          <h2 className="card-title mb-3">Profile</h2>
          <p className="card-text">First Name: {first_name}</p>
          <p className="card-text">Last Name: {last_name}</p>
          <p className="card-text">Role: {role}</p>
          <p className="card-text">Email: {email}</p>
          <p className="card-text">Department: {specialization}</p>
          <p className="card-text">Hospital: {hospital_affiliation}</p>
        </div>
      </div>
    </div>
  )
}

export default Profile