
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);

  useEffect(() => {
    const fetchJobAndApplicationStatus = async () => {
      try {
        // 1. Fetch Job Details
        const jobRes = await axios.get(`http://localhost:8000/api/public/jobs/${id}/`);
        setJob(jobRes.data);

        // 2. If user is logged in, check if they already applied
        const token = localStorage.getItem('access_token');
        if (token) {
          const appRes = await axios.get('http://localhost:8000/api/candidate/applications/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Find the most recent application for this specific job title
          const existingApp = appRes.data.find(app => app.job_title === jobRes.data.title);
          if (existingApp) {
            setApplicationStatus(existingApp.status);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load job details. Please try again.");
      }
    };

    fetchJobAndApplicationStatus();
  }, [id]);

  const handleApply = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate(`/login?redirect=/apply/${id}`);
    } else {
      navigate(`/apply/${id}`);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    Swal.fire({
      title: 'Link Copied!',
      text: 'The job link has been copied to your clipboard.',
      icon: 'success',
      confirmButtonColor: '#1591DC',
      confirmButtonText: 'Great!'
    });
  };

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1591DC] mb-4"></div>
          <p className="text-[#2C5EAD] font-semibold text-lg">Loading Job Details...</p>
        </div>
      </div>
    );
  }

  // Determine if the button should be disabled
  // If they have an application and it is NOT rejected, disable the button
  const isCurrentlyApplied = applicationStatus && applicationStatus !== 'REJECTED';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-t-8 border-[#2C5EAD]">
        
        <div className="p-8 sm:p-10 border-b border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2C5EAD] mb-4">
                {job.title}
              </h1>
              
              <div className="flex flex-wrap gap-2 text-sm font-semibold">
                <span className="bg-[#C4E2F5] text-[#2C5EAD] px-4 py-1.5 rounded-full">{job.department}</span>
                <span className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full flex items-center shadow-sm">
                  📍 {job.location}
                </span>
                <span className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full flex items-center shadow-sm">
                  💼 {job.employment_type}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
              <button 
                onClick={handleShare} 
                className="bg-gray-100 hover:bg-[#C4E2F5] text-[#2C5EAD] px-6 py-3 rounded-lg font-bold transition duration-200 flex items-center justify-center shadow-sm"
              >
                🔗 Share
              </button>
              
              {/* Dynamic Apply Button */}
              <button 
                onClick={handleApply} 
                disabled={isCurrentlyApplied}
                className={`px-8 py-3 rounded-lg font-extrabold text-lg transition duration-300 shadow-md ${
                  isCurrentlyApplied 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-[#1591DC] hover:bg-[#2C5EAD] text-white transform hover:-translate-y-0.5'
                }`}
              >
                {isCurrentlyApplied 
                  ? `Applied (${applicationStatus})` 
                  : applicationStatus === 'REJECTED' 
                    ? 'Apply Again' 
                    : 'Apply Now'}
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-inner">
            <div>
              <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Experience Req.</p>
              <p className="text-[#2C5EAD] font-extrabold text-lg">{job.experience_range}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Total Openings</p>
              <p className="text-[#2C5EAD] font-extrabold text-lg">{job.openings}</p>
            </div>
            {job.posted_date && (
              <div className="col-span-2 md:col-span-2 md:text-right">
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Date Posted</p>
                <p className="text-gray-700 font-semibold">{new Date(job.posted_date).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-8 sm:p-10">
          <h2 className="text-2xl font-extrabold text-[#2C5EAD] mb-6 border-b-2 border-[#4BB8FA] pb-2 inline-block">
            Job Description & Requirements
          </h2>
          <div className="text-gray-700 leading-loose whitespace-pre-line text-lg">
            {job.job_description}
          </div>
        </div>

      </div>
    </div>
  );
}