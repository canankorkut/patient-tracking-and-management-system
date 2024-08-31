import React, { useState} from 'react'
import axios from 'axios'

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password })
            if (res && res.data) {  
                localStorage.setItem('token', res.data.token);
                alert('Successfully logged in!');
              }
        } catch (err) {
            alert('Login failed: ' + err.response.data);
        }
    };

  return (
    <div>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
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
        </form>
    </div>
  )
}

export default Login