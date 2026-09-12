import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const Balance = () => {
  const [balance, setBalance] = useState(0)
  const [spent, setSpent] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [newBalance, setNewBalance] = useState('')

  async function fetchBalance() {
    try {
      const response = await axios.get(`${API_BASE}/api/balance`)
      setBalance(response.data.balance || 0)
    } catch (error) {
      console.error("Error fetching balance:", error)
    }
  }

  async function fetchSpent() {
    try {
      const response = await axios.get(`${API_BASE}/api/expenses`)
      setSpent(response.data || [])
    } catch (error) {
      console.error("Error fetching expenses:", error)
    }
  }

  const handleUpdateBalance = async (e) => {
    e.preventDefault()
    if (!newBalance || isNaN(newBalance)) return

    try {
      const response = await axios.post(`${API_BASE}/api/balance`, {
        balance: Number(newBalance)
      })
      setBalance(response.data.balance)
      setIsEditing(false)
      setNewBalance('')
    } catch (error) {
      console.error("Error updating balance:", error)
    }
  }

  useEffect(() => {
    fetchSpent()
    fetchBalance()
  }, [])

  // Total calculations
  const totalSpent = spent.reduce((acc, item) => acc + Number(item.price || 0), 0)
  const remainingBalance = balance - totalSpent

  return (
    <div className='my-10 flex flex-col gap-4'>
      <div className='flex gap-4'>
        {/* Total Starting Balance Card */}
        <div className="total-balance bg-gray-100 border-gray-300 border w-1/2 p-4 rounded-xl flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className='text-gray-600 text-sm'>Total Starting Balance</h1>
            <h1 className='text-3xl font-bold text-gray-800'>
              Rs {balance.toLocaleString()}
            </h1>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className='bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition'
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* Total Spent Card */}
        <div className="total-spent bg-gray-100 border-gray-300 border w-1/2 p-4 rounded-xl">
          <div className="flex flex-col">
            <h1 className='text-gray-600 text-sm'>Total Spent</h1>
            <h1 className='text-3xl font-bold text-red-600'>
              Rs {totalSpent.toLocaleString()}
            </h1>
          </div>
        </div>
      </div>

      {/* Remaining Balance Summary Banner */}
      <div className="remaining-balance bg-green-50 border-green-300 border p-4 rounded-xl flex justify-between items-center">
        <h1 className='text-green-800 font-semibold'>Remaining Net Balance</h1>
        <h1 className='text-2xl font-bold text-green-700'>
          Rs {remainingBalance.toLocaleString()}
        </h1>
      </div>

      {/* Update Balance Form */}
      {isEditing && (
        <form onSubmit={handleUpdateBalance} className='flex gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200'>
          <input
            type="number"
            placeholder="Enter new total balance..."
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            className='border border-gray-300 rounded px-3 py-1 w-full outline-none focus:border-blue-500'
          />
          <button type="submit" className='bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700'>
            Save
          </button>
        </form>
      )}
    </div>
  )
}

export default Balance