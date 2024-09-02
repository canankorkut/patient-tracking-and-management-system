import React, { useState} from 'react'
import "./App.css"
// import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from "./components/Login"
import Signup from "./components/Signup"

function App() {
  const [currentForm, setCurrentForm] = useState("login")

  const toggleForm = (formName) => {
    setCurrentForm(formName)
  }
  return (
    <div className='App'>
      {
        currentForm === "login" ? <Login onFormSwitch={toggleForm}/> : <Signup onFormSwitch={toggleForm}/>
      }
    </div>
  )
}

export default App
