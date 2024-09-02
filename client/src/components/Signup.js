import React, { useState } from 'react'
import axios from 'axios'
import '../styles/auth.css'

function Signup(props) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("patient")

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://localhost:5000/api/auth/signup', { email, password, role })
            alert('Successfully registered!')
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
                    <option value='patient'>Patient</option>
                    <option value='doctor'>Doctor</option>
                </select>
                <button type='submit'>Signup</button>
                <button className='link-btn' onClick={() => props.onFormSwitch('login')}>Already have an account? Login here.</button>
            </form>
        </div> 
    </div>
  )
}

export default Signup