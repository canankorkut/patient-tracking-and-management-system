import React, {useState} from 'react'
import axios from 'axios'
import '../styles/Auth.css'
import { useNavigate } from 'react-router-dom'

function Signup() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [dateOfBirth, setDateOfBirth] = useState("")
    const [gender, setGender] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [address, setAddress] = useState("")
    const [specialization, setSpecialization] = useState("")
    const [hospitalAffiliation, setHospitalAffiliation] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://localhost:5000/api/auth/signup', { 
                email, password, role, firstName, lastName, dateOfBirth, gender, phoneNumber, address, specialization, hospitalAffiliation 
            })
        } catch (err) {
            alert('Registration failed: ', err.response.data)
        }
    }
  return (
    <div className='auth-container'>
        <div className='image-container'></div>
        <div className='auth-form-wrapper'>
            <form className='register-form' onSubmit={handleSubmit}>
                <h2>Signup</h2>
                <input 
                    type='text'
                    placeholder='First Name'
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
                <input 
                    type='text'
                    placeholder='Last Name'
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
                <input 
                    type='email'
                    placeholder='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input 
                    type='password'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value=''>Select Role</option>
                    <option value='patient'>Patient</option>
                    <option value='doctor'>Doctor</option>
                    <option value='admin'>Admin</option>
                </select>
                {role === 'patient' && (
                    <>
                        <input 
                            type='date'
                            placeholder='Date of Birth'
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            required
                        />
                        <select 
                            value={gender} 
                            onChange={(e) => setGender(e.target.value)}
                            required
                        >
                            <option value='male'>Male</option>
                            <option value='female'>Female</option>
                            <option value='other'>Other</option>
                        </select>
                        <input 
                            type='text'
                            placeholder='Phone Number'
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                        <input 
                            type='text'
                            placeholder='Address'
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </>
                )}
                {role === 'doctor' && (
                    <>
                        <input 
                            type='text'
                            placeholder='Specialization'
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            required
                        />
                        <input 
                            type='text'
                            placeholder='Hospital Affiliation'
                            value={hospitalAffiliation}
                            onChange={(e) => setHospitalAffiliation(e.target.value)}
                            required
                        />
                    </>
                )}
                <button type='submit' className='signup-button'>Signup</button>
                <div className='link-container'>
                    <button type='button' className='link-btn' onClick={() => navigate('/login')}>Already have an account? Login here.</button>
                </div>
            </form>
        </div> 
    </div>
  )
}

export default Signup