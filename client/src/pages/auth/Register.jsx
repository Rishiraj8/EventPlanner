"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import API from "../../services/api"
import { motion } from "framer-motion"
import { UserPlus, User, Lock, Mail, AlertTriangle } from "lucide-react"

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await API.post("/auth/register", formData)
      setSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl border border-gray-300 relative z-10"
      >
        {success ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 border border-violet-300 mb-4">
              <svg
                className="w-8 h-8 text-violet-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">Your account has been created successfully.</p>
            <p className="text-violet-500 animate-pulse">Redirecting to login page...</p>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 mb-4">
                <UserPlus className="h-8 w-8 text-violet-500" />
              </div>
              <h2 className="text-2xl font-bold text-black">Create Account</h2>
              <p className="text-gray-600 mt-1">Join EventPulse today</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-100 border border-red-300 text-red-600 px-4 py-3 rounded-lg flex items-start"
              >
                <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-black mb-1 flex items-center">
                  <User className="w-4 h-4 mr-2 text-violet-500" />
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors duration-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black mb-1 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-violet-500" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors duration-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black mb-1 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-violet-500" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors duration-300"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-600">Password must be at least 6 characters long</p>
              </div>

              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-violet-500 hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-300 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Create Account
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-violet-500 hover:text-violet-400 font-medium transition-colors duration-300"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
