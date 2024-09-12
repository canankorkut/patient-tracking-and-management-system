import React, {useState} from 'react'
import Appointments from './Appointments'

function ParentComponent() {
    const [appointments, setAppointments] = useState([])
  return (
    <div>
        <Appointments appointments={appointments} setAppointments={setAppointments} />
    </div>
  )
}

export default ParentComponent