import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Message state to store dynamic feedback text & type
  const [message, setMessage] = useState({ text: '', type: '' }) 
  const navigate = useNavigate()

  // 1. Separate useForm instance for Signup
  const {
    register: registerSignup,
    reset: resetSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: signupErrors, isSubmitting: isSignupSubmitting }
  } = useForm()

  // 2. Separate useForm instance for Login
  const {
    register: registerLogin,
    reset: resetLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting }
  } = useForm()

  const toggleAuthMode = () => {
    setIsLogin(prev => !prev)
    setMessage({ text: '', type: '' }) // Clear message on tab switch
    resetSignup()
    resetLogin()
  }

  // Submit handler for Signup
  const onSignupSubmit = async (data) => {
    setMessage({ text: '', type: '' })
    try {
      const response = await axios.post(`${BASE_URL}/api/user/sign-up`, data)
      setMessage({
        text: response.data.message || "Account created successfully! Sign-in now ",
        type: "success"
      })
      resetSignup();
    
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Signup failed. Please try again.",
        type: "error"
      })
    }
  }

  // Submit handler for Login
  const onLoginSubmit = async (data) => {
    setMessage({ text: '', type: '' })
    try {
  
      const response = await axios.post(`${BASE_URL}/api/user/sign-in`, data)
       console.log(response.data);
       const token=response.data.token;
       const name=response.data.user_info.name
       localStorage.setItem("token",token);
      localStorage.setItem("name",name)
      setMessage({
        text: "Login successful! Redirecting...",
        type: "success"
      })
      resetLogin()
      setTimeout(() => navigate("/dashboard"), 1000)
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Invalid credentials. Please try again.",
        type: "error"
      })
    }
  }

  return (
    <div className="md:flex gap-2 w-full min-h-screen">
      {/* LEFT SIDE OF THE SCREEN */}
      <div className="bg-blue-200 hidden md:block w-[50%]">
        <div className="left-content mx-10 my-20 flex flex-col gap-8">
          <div className="left-content-header flex gap-2">
            <h1 className="text-3xl text-blue-500 font-bold">Track every Rupee</h1>
            <img width="34" src="dollar-sign-96.png" alt="" />
          </div>
          <div className="para text-blue-400 max-w-100">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique, repudiandae. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Reprehenderit, iure!
          </div>
        </div>
      </div>

      {/* RIGHT SIDE OF THE FORM */}
      <div className="login-box-form md:w-[60%] p-2">
        <div className="login-box-header md:w-[60%] md:mt-12 my-8 flex flex-col items-center justify-center">
          <div className="img">
            <img className="md:hidden" width="32" src="dollar-sign-96.png" alt="" />
          </div>
          <h1 className="text-center font-semibold md:text-3xl">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <h4 className="text-center font-light">
            {isLogin ? "Enter your details to log in" : "Start tracking your expenses"}
          </h4>
        </div>

        {/* DYNAMIC MESSAGE BANNER CONTAINER */}
        {message.text && (
          <div 
            className={`md:w-[60%] mx-auto my-2 p-3 text-sm rounded-md border text-center ${
              message.type === 'success' 
                ? 'bg-green-100 border-green-400 text-green-700' 
                : 'bg-red-100 border-red-400 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* ------------------- SIGNUP FORM ------------------- */}
        {!isLogin ? (
          <form 
            className="flex md:w-[60%] mx-auto md:mx-[1%] flex-col gap-1 p-2" 
            onSubmit={handleSubmitSignup(onSignupSubmit)}
          >
            <label>Full name</label>
            <input 
              {...registerSignup("name", { required: "Name is required" })} 
              placeholder="Enter your full name" 
              className="border border-gray-400 text-sm px-2 py-2 md:py-2 w-full rounded" 
              type="text" 
            />
            {signupErrors.name && <p className="text-red-500 text-sm">{signupErrors.name.message}</p>}

            <label>Email</label>
            <input 
              {...registerSignup("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Invalid email address"
                }
              })} 
              placeholder="Enter your email" 
              className="border md:py-2 border-gray-400 w-full text-sm px-2 py-2 rounded" 
              type="text" 
            />
            {signupErrors.email && <p className="text-red-500 text-sm">{signupErrors.email.message}</p>}

            <label>Password</label>
            <input 
              {...registerSignup("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })} 
              placeholder="Enter your password" 
              className="border border-gray-400 md:py-2 w-full text-sm px-2 py-2 rounded" 
              type="password" 
            />
            {signupErrors.password && <p className="text-red-500 text-sm">{signupErrors.password.message}</p>}

            <div className="submit-button flex items-center justify-center mt-4">
              <button 
                disabled={isSignupSubmitting} 
                type="submit" 
                className="border cursor-pointer w-full bg-black text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSignupSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>

            <div className="text-center mt-3 text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <button 
                type="button" 
                onClick={toggleAuthMode} 
                className="text-blue-500 font-semibold underline cursor-pointer ml-1"
              >
                Log In
              </button>
            </div>
          </form>
        ) : (
          /* ------------------- LOGIN FORM ------------------- */
          <form 
            className="flex md:w-[60%] mx-auto md:mx-[1%] flex-col gap-1 p-2" 
            onSubmit={handleSubmitLogin(onLoginSubmit)}
          >
            <label>Email</label>
            <input 
              {...registerLogin("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Invalid email address"
                }
              })} 
              placeholder="Enter your email" 
              className="border md:py-2 border-gray-400 w-full text-sm px-2 py-2 rounded" 
              type="text" 
            />
            {loginErrors.email && <p className="text-red-500 text-sm">{loginErrors.email.message}</p>}

            <label>Password</label>
            <input 
              {...registerLogin("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })} 
              placeholder="Enter your password" 
              className="border border-gray-400 md:py-2 w-full text-sm px-2 py-2 rounded" 
              type="password" 
            />
            {loginErrors.password && <p className="text-red-500 text-sm">{loginErrors.password.message}</p>}

            <div className="submit-button flex items-center justify-center mt-4">
              <button 
                disabled={isLoginSubmitting} 
                type="submit" 
                className="border cursor-pointer w-full bg-black text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoginSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </button>
            </div>

            <div className="text-center mt-3 text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <button 
                type="button" 
                onClick={toggleAuthMode} 
                className="text-blue-500 font-semibold underline cursor-pointer ml-1"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Auth