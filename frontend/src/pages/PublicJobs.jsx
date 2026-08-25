
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

export default function PublicJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  const fetchJobs = async () => {
    try {
      let url = `http://localhost:8000/api/public/jobs/?`;
      if (search) url += `search=${search}&`;
      if (location) url += `location=${location}&`;
      const res = await axios.get(url);
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to load jobs", err);
      toast.error("Failed to load open positions. Please try again later.");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, location]);

  const handleShare = (jobTitle, jobId) => {
    const link = `${window.location.origin}/jobs/${jobId}`;
    navigator.clipboard.writeText(link);
    
    Swal.fire({
      title: 'Link Copied!',
      text: `The application link for ${jobTitle} is in your clipboard.`,
      icon: 'success',
      confirmButtonColor: '#1591DC', // Primary Blue
      confirmButtonText: 'Great!'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center sm:text-left mb-10">
          <h1 className="text-4xl font-extrabold text-[#2C5EAD] mb-4">Open Positions</h1>
          <p className="text-gray-600 text-lg">Discover your next career opportunity with us.</p>
        </div>
        
        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search by job title..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4BB8FA] focus:border-transparent outline-none transition shadow-sm"
            />
          </div>
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <input 
              type="text" 
              placeholder="Filter by location..." 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4BB8FA] focus:border-transparent outline-none transition shadow-sm"
            />
          </div>
        </div>

        {/* Job Cards Grid */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h3 className="text-xl text-gray-500 font-medium">No open positions found matching your criteria.</h3>
            <button onClick={() => {setSearch(''); setLocation('');}} className="mt-4 text-[#1591DC] font-semibold hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-lg hover:border-[#4BB8FA] transition duration-300 group">
                
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-[#C4E2F5] text-[#2C5EAD] text-xs font-bold rounded-full mb-3">
                    {job.department}
                  </span>
                  <h2 className="text-xl font-bold text-[#2C5EAD] group-hover:text-[#1591DC] transition duration-200">
                    {job.title}
                  </h2>
                </div>

                <div className="text-sm text-gray-600 flex-grow space-y-2 mb-6">
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {job.location}
                  </p>
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    {job.employment_type}
                  </p>
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Experience: {job.experience_range}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                  <Link 
                    to={`/jobs/${job.id}`} 
                    className="flex-1 bg-[#1591DC] hover:bg-[#2C5EAD] text-white text-center py-2.5 rounded-lg font-semibold transition duration-200 shadow-sm"
                  >
                    View Details
                  </Link>
                  <button 
                    onClick={() => handleShare(job.title, job.id)} 
                    className="sm:w-auto bg-gray-100 hover:bg-[#C4E2F5] text-[#2C5EAD] py-2.5 px-4 rounded-lg font-semibold transition duration-200 flex justify-center items-center"
                    title="Copy Link"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}