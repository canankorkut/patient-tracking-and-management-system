import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from "./components/Login"
import Signup from "./components/Signup"
import Patient from "./pages/Patient"
import '@fortawesome/fontawesome-free/css/all.min.css'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min"
import "./App.css"

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route index element={<Login />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />}/>
          <Route path='/patient' element={<Patient />}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
