import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/auth/register/', formData);
      
      // SweetAlert for beautiful success confirmation
      Swal.fire({
        title: 'Registration Successful!',
        text: 'Your account has been created successfully. Please log in to continue.',
        icon: 'success',
        confirmButtonColor: '#2C5EAD',
        confirmButtonText: 'Go to Login'
      }).then(() => {
        navigate('/login');
      });

    } catch (err) {
      if (err.response && err.response.data) {
        // Extract and format Django form validation errors beautifully
        const errorMessages = Object.entries(err.response.data)
          .map(([key, value]) => `• ${key.toUpperCase()}: ${Array.isArray(value) ? value.join(' ') : value}`)
          .join('\n');
        
        // SweetAlert for detailed validation errors (like "Password too short")
        Swal.fire({
          title: 'Registration Failed',
          text: errorMessages,
          icon: 'error',
          confirmButtonColor: '#d33',
          customClass: {
            popup: 'text-left whitespace-pre-wrap' // Keeps the bullet points aligned
          }
        });
      } else {
        // Toastify for generic network/server errors
        toast.error('Error registering. Is the server running?');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-t-8 border-[#2C5EAD] p-8 sm:p-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#2C5EAD] mb-2">Create an Account</h2>
          <p className="text-gray-500">Join Talent Bridge Careers today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
            <input 
              required 
              type="text"
              placeholder="John Doe" 
              onChange={e => setFormData({...formData, username: e.target.value})} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4BB8FA] focus:border-transparent transition shadow-sm outline-none"
            />
          </div>

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
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <input 
              required 
              type="password" 
              placeholder="••••••••" 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4BB8FA] focus:border-transparent transition shadow-sm outline-none"
            />
            <p className="text-xs text-gray-400 mt-2 text-right">Must be at least 8 characters</p>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#1591DC] hover:bg-[#2C5EAD] text-white font-extrabold text-lg py-3 rounded-lg transition duration-300 shadow-md transform hover:-translate-y-0.5 mt-2"
          >
            Register
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#1591DC] hover:text-[#2C5EAD] hover:underline transition">
              Log in here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}