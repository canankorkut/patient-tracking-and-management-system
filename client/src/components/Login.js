import React, {useState} from 'react'
import axios from 'axios'
import '../styles/Auth.css'
import { useNavigate } from 'react-router-dom'

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password })
            if (res && res.data) {  
                localStorage.setItem('token', res.data.token);
                const userRes = await axios.get('/api/users/user', {
                    headers: { Authorization: `Bearer ${res.data.token}` }
                });
                const { role } = userRes.data;
                if (role === 'patient') {
                    navigate('/patient');
                } else if (role === 'doctor') {
                    navigate('/doctor');
                } else if (role === 'admin') {
                    navigate('/admin');
                } else {
                    alert('Role not recognized');
                }
            }
        } catch (err) {
            alert('Login failed: ' + err.response.data);
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
                <button type='submit'>Login</button>
                <button className='link-btn' onClick={() => navigate('/signup')}>Don't have an account? Register here.</button>
            </form>
        </div>    
    </div>
  )
}

export default Login