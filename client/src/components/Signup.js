import React, { useState } from 'react'
import axios from 'axios'

function Signup() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("patient")

    const handleSignup = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://localhost:5000/api/auth/signup', { email, password, role })
            alert('Successfully registered!')
        } catch (err) {
            alert('Registration failed: ', err.response.data)
        }
    }
  return (
    <div>
        <h2>Signup</h2>
        <form onSubmit={handleSignup}>
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
        </form>
    </div>
  )
}

export default Signup