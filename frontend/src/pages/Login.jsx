




import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/auth/login/', formData);
      
      // Save token
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('role', res.data.role);
      
      toast.success("Login successful! Redirecting...");

      // Route based on role
      setTimeout(() => {
        if (res.data.role === 'ADMIN') {
          navigate('/admin');
        } else {
          // Check if there's a pending redirect (like from a Job Detail page)
          const urlParams = new URLSearchParams(window.location.search);
          const redirect = urlParams.get('redirect');
          navigate(redirect || '/candidate-dashboard'); 
        }
      }, 1000);
      
    } catch (err) {
      toast.error('Invalid email or password.');
    }
  };

  const handleForgotPassword = async () => {
    const { value: email } = await Swal.fire({
      title: 'Forgot Password?',
      text: "Enter your registered email address to receive a reset link.",
      input: 'email',
      inputPlaceholder: 'name@example.com',
      showCancelButton: true,
      confirmButtonColor: '#1591DC', // Primary Blue
      cancelButtonColor: '#d33',
      confirmButtonText: 'Send Reset Link',
      customClass: {
        confirmButton: 'font-bold rounded-lg px-4 py-2',
        cancelButton: 'font-bold rounded-lg px-4 py-2'
      }
    });

    if (email) {
      try {
        await axios.post('http://localhost:8000/api/auth/forgot-password/', { email });
        Swal.fire({
          title: 'Link Sent!',
          text: 'If an account exists with that email, a reset link has been sent.',
          icon: 'success',
          confirmButtonColor: '#2C5EAD'
        });
      } catch (err) {
        toast.error("Failed to process request. Ensure the server is running.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-t-8 border-[#2C5EAD] p-8 sm:p-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#2C5EAD] mb-2">Welcome Back</h2>
          <p className="text-gray-500">Sign in to your SmartSkale account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <input 
              required 
              type="email" 
              placeholder="name@example.com" 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4BB8FA] focus:border-transparent transition shadow-sm outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700">Password</label>
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="text-sm font-semibold text-[#1591DC] hover:text-[#2C5EAD] transition"
              >
                Forgot password?
              </button>
            </div>
            <input 
              required 
              type="password" 
              placeholder="••••••••" 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4BB8FA] focus:border-transparent transition shadow-sm outline-none"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#1591DC] hover:bg-[#2C5EAD] text-white font-extrabold text-lg py-3 rounded-lg transition duration-300 shadow-md transform hover:-translate-y-0.5"
          >
            Log In
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-gray-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-[#1591DC] hover:text-[#2C5EAD] hover:underline transition">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}






