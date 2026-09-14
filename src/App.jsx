import React, { useEffect } from 'react'
import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Balance from './components/Balance'
import { useState } from 'react'
import ProtectedRoute from './ProtectedRoute'

const INITIAL_BALANCE = 30000;

const getInitialBalance = () => {
  const stored = localStorage.getItem("balance");
  return stored !== null ? Number(stored) : INITIAL_BALANCE;
};

const getInitialSpent = () => {
  const stored = localStorage.getItem("spend");
  return stored !== null ? Number(stored) : 0;
};

function App() {

  const [balance, setBalance] = useState(getInitialBalance);
  const [spent, setSpent] = useState(getInitialSpent);

  // Lock in the starting values in localStorage on first-ever load,
  // so a refresh before any transaction doesn't leave localStorage empty.
  useEffect(() => {
    if (localStorage.getItem("balance") === null) {
      localStorage.setItem("balance", INITIAL_BALANCE);
    }
    if (localStorage.getItem("spend") === null) {
      localStorage.setItem("spend", 0);
    }
  }, []);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
      
        <Route path="/dashboard" element={
         <ProtectedRoute>
           <Dashboard balance={balance} setBalance={setBalance} spent={spent} setSpent={setSpent} />

         </ProtectedRoute>
          
          } />
      

        <Route path="/balance" element={<Balance balance={balance} setBalance={setBalance} spent={spent} setSpent={setSpent} />} />
      </Routes>
    </div>
  )
}

export default App