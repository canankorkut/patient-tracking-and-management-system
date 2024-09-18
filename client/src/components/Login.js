import React, {useState} from 'react'
import axios from 'axios'
import '../styles/Auth.css'
import { useNavigate } from 'react-router-dom'

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password })
            if (res && res.data) {
                localStorage.setItem('token', res.data.token)
    
                const userRes = await axios.get('/api/users/user', {
                    headers: { Authorization: `Bearer ${res.data.token}` }
                })
                
                const { role, roleDetails } = userRes.data
    
                if (role === 'patient') {
                    if (roleDetails && roleDetails.patient_id) {
                        localStorage.setItem('patient_id', roleDetails.patient_id)
                        navigate('/patient')
                    } else {
                        alert('Patient ID not found')
                    }
                } else if (role === 'doctor') {
                    if (roleDetails && roleDetails.doctor_id) {
                        localStorage.setItem('doctor_id', roleDetails.doctor_id)
                        navigate('/doctor')
                    } else {
                        alert('Doctor ID not found')
                    }
                } else if (role === 'admin') {
                    if (roleDetails && roleDetails.admin_id) {
                        localStorage.setItem('admin_id', roleDetails.admin_id)
                        navigate('/admin')
                    } else {
                        alert('Admin ID not found')
                    }
                } else {
                    alert('Role not recognized')
                }
            }
        } catch (err) {
            const errorMessage = err.response && err.response.data ? err.response.data : 'An error occurred'
            alert('Login failed: ' + errorMessage)
        }
    
    };

  return (
    <div className='auth-container'>
        <div className='image-container'></div>
        <div className='auth-form-wrapper'>
            <form className='login-form' onSubmit={handleSubmit}>
                <h2>Login</h2>
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
                <button type='submit' className='login-button'>Login</button>
                <div className='link-container'>
                    <button type='button' className='link-btn' onClick={() => navigate('/signup')}>Don't have an account? Register here.</button>
                </div>
            </form>
        </div>    
    </div>
  )
}

export default Login