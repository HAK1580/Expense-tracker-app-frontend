import React, { useEffectEvent } from 'react'
import Navbar from '../components/Navbar'
import Balance from '../components/Balance'
import { useState,useEffect } from 'react'
import Expenses from '../components/Expenses'

const Dashboard = () => {
  return (
    <div className='p-5 relative bg-slate-50'>
      <Navbar />
      <Balance  />
      <Expenses   />
    </div>  
  )
}

export default Dashboard