import React from 'react'
import Navbar from './components/Navbar'
import {Route,Routes} from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Balance from './components/Balance'
import { useState } from 'react'

function App() {


 


  return (
    <div  >
     <Routes>
      <Route path="/" element= {<Login />}   />
      <Route path="/login" element= {<Login />}   />
      <Route path="/balance" element= {<Balance  />}   />
      <Route path="/dashboard" element= {<Dashboard />}   />
    
    
     </Routes>
      
    </div>
  )
}

export default App