
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CandidateDashboard() {
  const [applications, setApplications] = useState([]);
  const [fullView, setFullView] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchMyApps = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error("Unauthorized. Please log in.");
          navigate('/login');
          return;
        }

        const res = await axios.get('http://localhost:8000/api/candidate/applications/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data);
        
        if (res.data.length === 0) {
          toast.info("You haven't applied to any jobs yet. Start exploring!");
        }
      } catch (err) {
        console.error("Failed to load applications", err);
        toast.error("Failed to load your applications. Please try again.");
      }
    };
    fetchMyApps();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-[#2C5EAD]">My Applications</h2>
          <Link 
            to="/" 
            className="bg-[#1591DC] hover:bg-[#2C5EAD] text-white px-6 py-3 rounded-lg font-semibold shadow-md transition duration-300 w-full sm:w-auto text-center"
          >
            + Find More Opportunities
          </Link>
        </div>

        {/* --- LIST (TABLE) VIEW --- */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow border border-gray-100 p-10 text-center">
            <h3 className="text-xl text-gray-500 font-medium mb-4">No applications found.</h3>
            <Link to="/" className="text-[#1591DC] hover:underline font-semibold">Browse open jobs</Link>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#C4E2F5]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">App ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Applied On</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map(app => (
                  <tr key={app.app_id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {app.app_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#2C5EAD]">
                      {app.job_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.submitted_at.split(' ')[0]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border
                        ${app.status === 'NEW' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 
                          app.status === 'REVIEWED' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-green-50 text-green-700 border-green-200'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <button 
                        onClick={() => setFullView(app)} 
                        className="bg-[#C4E2F5] text-[#2C5EAD] hover:bg-[#1591DC] hover:text-white px-4 py-2 rounded-lg font-bold transition duration-200 shadow-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FULL DETAILS MODAL OVERLAY (Unchanged) */}
      {fullView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
          {/* MODAL BOX */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border-t-8 border-[#1591DC]">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-start shadow-sm">
              <div className="flex gap-5 items-center">
                {fullView.profile_photo ? (
                  <img src={fullView.profile_photo} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-[#C4E2F5] shadow-sm" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#C4E2F5] flex items-center justify-center border-4 border-white shadow-sm text-[#2C5EAD] font-bold text-xl">
                    {fullView.first_name[0]}{fullView.last_name[0]}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-extrabold text-[#2C5EAD]">{fullView.first_name} {fullView.last_name}</h3>
                  <p className="text-sm text-gray-500 mt-1">ID: <span className="font-semibold text-gray-800">{fullView.app_id}</span> • Applied: {fullView.submitted_at}</p>
                  
                  {fullView.resume_url && (
                    <a 
                      href={fullView.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="mt-3 inline-block bg-[#4BB8FA] hover:bg-[#1591DC] text-white px-4 py-1.5 rounded text-sm font-semibold transition shadow-sm"
                    >
                      📄 View Resume
                    </a>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setFullView(null)} 
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column */}
              <div className="space-y-8">
                <section>
                  <h4 className="text-lg font-bold text-[#2C5EAD] border-b-2 border-[#C4E2F5] pb-2 mb-4">Bio-Data</h4>
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 shadow-sm">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                      <div><dt className="text-gray-500 font-medium">Email</dt><dd className="font-semibold text-gray-900 break-all">{fullView.email}</dd></div>
                      <div><dt className="text-gray-500 font-medium">Mobile</dt><dd className="font-semibold text-gray-900">{fullView.mobile}</dd></div>
                      <div><dt className="text-gray-500 font-medium">Gender</dt><dd className="font-semibold text-gray-900">{fullView.gender}</dd></div>
                      <div><dt className="text-gray-500 font-medium">Date of Birth</dt><dd className="font-semibold text-gray-900">{fullView.dob}</dd></div>
                      <div><dt className="text-gray-500 font-medium">Location</dt><dd className="font-semibold text-gray-900">{fullView.location}</dd></div>
                      <div><dt className="text-gray-500 font-medium">Notice Period</dt><dd className="font-semibold text-gray-900">{fullView.notice_period}</dd></div>
                      <div className="sm:col-span-2"><dt className="text-gray-500 font-medium">Current Company</dt><dd className="font-semibold text-gray-900">{fullView.current_company}</dd></div>
                      <div className="sm:col-span-2"><dt className="text-gray-500 font-medium">Address</dt><dd className="font-semibold text-gray-900">{fullView.current_address}</dd></div>
                    </dl>
                  </div>
                </section>

                {fullView.cover_note && fullView.cover_note !== 'N/A' && (
                  <section>
                    <h4 className="text-lg font-bold text-[#2C5EAD] border-b-2 border-[#C4E2F5] pb-2 mb-4">Cover Note</h4>
                    <div className="bg-[#C4E2F5] bg-opacity-30 rounded-lg p-5 border border-[#C4E2F5] text-gray-700 italic text-sm leading-relaxed whitespace-pre-line shadow-inner">
                      "{fullView.cover_note}"
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                <section>
                  <h4 className="text-lg font-bold text-[#2C5EAD] border-b-2 border-[#C4E2F5] pb-2 mb-4">Education</h4>
                  <div className="space-y-3">
                    {fullView.education.map((edu, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition duration-200 border-l-4 border-l-[#1591DC]">
                        <h5 className="font-bold text-gray-900">{edu.level} - {edu.degree} {edu.specialization && <span className="text-[#1591DC]">({edu.specialization})</span>}</h5>
                        <p className="text-sm text-gray-600 mt-1">{edu.institution}</p>
                        <div className="flex justify-between items-center mt-2 text-xs font-semibold text-gray-500 bg-gray-50 p-2 rounded">
                          <span>Year of passing: {edu.year}</span>
                          <span>Grade: {edu.grade}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-lg font-bold text-[#2C5EAD] border-b-2 border-[#C4E2F5] pb-2 mb-4">Work Experience</h4>
                  <div className="space-y-3">
                    {fullView.experience?.length > 0 ? (
                      fullView.experience.map((exp, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition duration-200 border-l-4 border-l-[#4BB8FA]">
                          <h5 className="font-bold text-gray-900">{exp.designation} <span className="font-normal text-gray-500">at</span> {exp.company}</h5>
                          <p className="text-xs font-bold text-[#1591DC] mt-1">{exp.start_date} — {exp.end_date}</p>
                          {exp.responsibilities && (
                            <p className="mt-3 text-sm text-gray-600 whitespace-pre-line leading-relaxed bg-gray-50 p-3 rounded-md">
                              {exp.responsibilities}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center shadow-sm">
                        <span className="text-gray-500 font-medium">Applied as Fresher / No Work Experience</span>
                      </div>
                    )}
                  </div>
                </section>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}