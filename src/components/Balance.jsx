import React from 'react'
import Dashboard from '../pages/Dashboard'
import { useState } from 'react'
const Balance = ({balance,setBalance,setSpent,spent}) => {
  const [localbalance,setLocalbalance]=useState();
  
  return (
    <div className='my-15    flex gap-4 '>
     <div className="total-balance  bg-gray-100 border-gray-300 border w-[50%] min-h-25 rounded-xl ">
        <div className="text flex flex-col">
        <h1 className='text-gray-600  p-2' >Balance</h1>
        <h1 className='text-3xl font-bold mx-2 ' >  Rs  {Number(balance)}</h1>
         </div>
     </div>
     
     <div className="total-spent bg-gray-100 border-gray-300 border w-[50%]   min-h-25 rounded-xl ">
        <div className="text flex flex-col">
        <h1 className='text-gray-600 mx-2 p-2' >Spent</h1>
        <h1 className='text-2xl text-red-600 font-semibold mx-2 ' > Rs {spent}</h1>
         </div>

     </div>
        
        </div>
  )
}

export default Balance