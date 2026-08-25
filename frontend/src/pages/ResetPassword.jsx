import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`http://localhost:8000/api/auth/reset-password/${uid}/${token}/`, { password });
      
      Swal.fire({
        title: 'Success!',
        text: 'Your password has been successfully reset. You can now log in.',
        icon: 'success',
        confirmButtonColor: '#2C5EAD',
        confirmButtonText: 'Go to Login'
      }).then(() => {
        navigate('/login');
      });

    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid or expired link. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-t-8 border-[#2C5EAD] p-8 sm:p-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#2C5EAD] mb-2">Reset Password</h2>
          <p className="text-gray-500">Please enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
            <input 
              required 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4BB8FA] focus:border-transparent transition shadow-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
            <input 
              required 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4BB8FA] focus:border-transparent transition shadow-sm outline-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1591DC] hover:bg-[#2C5EAD] text-white font-extrabold text-lg py-3 rounded-lg transition duration-300 shadow-md transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}