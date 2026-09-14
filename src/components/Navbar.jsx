import React from 'react'
import axios from 'axios'
import { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
const Navbar = () => {
 const navigate=useNavigate();
const [name,setName]=useState(localStorage.getItem("name"));
function Logout(){
  localStorage.removeItem("token");
  navigate('/'); 

}

  return (
    <div className="navbar-container  bg-gray-50 shadow-sm rounded-2xl  md:p-5  p-2">
        
          <ul className="flex  justify-between items-center">
            <div className="left-text flex flex-col">
           <li className="text-sm md:text-lg" >Welcome back </li>
           <li className="font-bold text-lg md:text-2xl" >{name} </li>
        </div>
          <div className="right-text  flex items-center gap-3 md:gap-8  mx-2">
            <div className="log-out">
              <button onClick={Logout}   className='bg-red-400 md:py-3 md:px-5 py-2 px-1  hover:bg-red-500 cursor-pointer rounded-full ' >Log out</button>

            </div>
            <div className="rounded-full md:p-4 p-2 bg-blue-300 border border-gray-300">
                 AO
            </div>
            
          </div>


          </ul>
  
      </div>
  )
}

export default Navbar