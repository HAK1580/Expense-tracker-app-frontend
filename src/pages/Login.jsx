import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false)
  const { register, reset, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const navigate = useNavigate()

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev)
    reset()
  }

  const onSubmit = async (data) => {
    console.log(isLogin ? "Login Data:" : "Signup Data:", data)
    await new Promise(resolve => setTimeout(resolve, 1500))
    reset() 
    navigate("/dashboard")
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

        <form className="flex md:w-[60%] mx-auto md:mx-[1%] flex-col gap-1 p-2" onSubmit={handleSubmit(onSubmit)}>
          {/* Full Name field - Only visible during Signup */}
          {!isLogin && (
            <>
              <label>Full name</label>
              <input 
                {...register("name", { required: !isLogin ? "Name is required" : false })} 
                placeholder="Enter your full name" 
                className="border border-gray-400 text-sm px-2 py-2 md:py-2 w-full rounded" 
                type="text" 
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </>
          )}

          <label>Email</label>
          <input 
            {...register("email", {
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
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

          <label>Password</label>
          <input 
            {...register("password", {
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
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

          <div className="submit-button flex items-center justify-center mt-4">
            <button 
              disabled={isSubmitting} 
              type="submit" 
              className="border cursor-pointer w-full bg-black text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {isLogin ? "Logging in..." : "Creating account..."}
                </>
              ) : (
                isLogin ? "Log In" : "Create Account"
              )}
            </button>
          </div>

          {/* Toggle link matching the form alignment */}
          <div className="text-center mt-3 text-sm">
            <span className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button 
              type="button"
              onClick={toggleAuthMode}
              className="text-blue-500 font-semibold underline cursor-pointer ml-1"
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Auth