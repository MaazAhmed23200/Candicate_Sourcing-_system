
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

export default function ApplicationsGrid() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fullAppView, setFullAppView] = useState(null);

  const token = localStorage.getItem('access_token');
  const apiConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchApplications = async () => {
    let url = `http://localhost:8000/api/admin/applications/?`;
    if (search) url += `search=${search}&`;
    if (statusFilter) url += `status=${statusFilter}&`;

    try {
      const res = await axios.get(url, apiConfig);
      setApplications(res.data);
    } catch (err) {
      console.error("Failed to fetch applications");
      toast.error("Failed to load applications.");
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, statusFilter]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await axios.patch(`http://localhost:8000/api/admin/applications/${appId}/status/`, { status: newStatus }, apiConfig);
      toast.success("Status updated successfully.");
      fetchApplications();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (appId) => {
    const result = await Swal.fire({
      title: 'Delete this application?',
      text: "This action cannot be undone. Are you sure you want to permanently delete this rejected application?",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#2C5EAD',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8000/api/admin/applications/${appId}/`, apiConfig);
        toast.success("Application deleted successfully.");
        fetchApplications();
      } catch (err) {
        toast.error("Failed to delete application.");
      }
    }
  };

  const handleExportCSV = () => {
    if (applications.length === 0) {
      toast.warn("No data to export.");
      return;
    }
    // Added AI Score to CSV headers
    const headers = "App ID,Job Title,Candidate,Email,Mobile,Location,Experience,AI Score,Status,Submitted At,Resume URL\n";
    const rows = applications.map(app => 
      `${app.app_id},"${app.job_title}","${app.candidate_name}",${app.email},${app.mobile},"${app.location}","${app.experience}",${app.ai_match_score || 'N/A'},${app.status},${app.submitted_at},${app.resume_url}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "applications_export.csv";
    link.click();
    toast.success("Export started!");
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-extrabold text-[#2C5EAD]">Review Applications</h2>
        <button 
          onClick={handleExportCSV} 
          className="bg-[#1591DC] hover:bg-[#2C5EAD] text-white font-bold py-2 px-6 rounded-lg transition duration-200 shadow-sm whitespace-nowrap"
        >
          Export to CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Search Name or Email..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4BB8FA] outline-none transition"
        />
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4BB8FA] outline-none transition bg-white sm:w-48"
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#C4E2F5]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Job Title</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Candidate Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Applied On</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Experience</th>
              
              {/* NEW: AI Match Column */}
              <th className="px-6 py-4 text-center text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">AI Match</th>
              
              <th className="px-6 py-4 text-left text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Resume</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.length === 0 ? (
              <tr><td colSpan="10" className="px-6 py-8 text-center text-gray-500 font-medium">No applications found.</td></tr>
            ) : (
              applications.map(app => (
                <tr key={app.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{app.job_title}</td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-[#1591DC] font-bold cursor-pointer hover:underline" 
                    onClick={() => setFullAppView(app)}
                  >
                    {app.candidate_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.submitted_at}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.experience}</td>
                  
                  {/* NEW: AI Match Badge */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {app.ai_processed ? (
                      <span className={`px-3 py-1 font-bold rounded-full text-xs border ${
                        app.ai_match_score >= 80 ? 'bg-green-50 text-green-700 border-green-200' : 
                        app.ai_match_score >= 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {app.ai_match_score}% Match
                      </span>
                    ) : (
                      <span className="text-gray-400 italic text-xs flex items-center justify-center gap-1">
                        <span className="animate-spin inline-block h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full"></span> 
                        Processing...
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="text-[#1591DC] hover:text-[#2C5EAD] font-semibold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> View
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select 
                      value={app.status} 
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className={`text-xs font-bold rounded-full px-3 py-1 outline-none cursor-pointer border
                        ${app.status === 'NEW' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 
                          app.status === 'REVIEWED' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-green-50 text-green-700 border-green-200'}`}
                    >
                      <option value="NEW">New</option>
                      <option value="REVIEWED">Reviewed</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {app.status === 'REJECTED' && (
                      <button 
                        onClick={() => handleDelete(app.id)} 
                        className="text-red-600 hover:text-white hover:bg-red-600 bg-red-50 px-3 py-1.5 rounded transition font-bold"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {fullAppView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border-t-8 border-[#1591DC]">
            
            
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-start shadow-sm">
              <div className="flex gap-5 items-center">
                {fullAppView.profile_photo ? (
                  <img src={fullAppView.profile_photo} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-[#C4E2F5]" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#C4E2F5] flex items-center justify-center border-4 border-white text-[#2C5EAD] font-bold text-xl">
                    {fullAppView.candidate_name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-extrabold text-[#2C5EAD]">{fullAppView.candidate_name}</h3>
                  <p className="text-sm text-gray-500 mt-1">ID: <span className="font-semibold text-gray-800">{fullAppView.app_id}</span> | Applied: {fullAppView.submitted_at}</p>
                  <a href={fullAppView.resume_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block bg-[#4BB8FA] hover:bg-[#1591DC] text-white px-4 py-1.5 rounded text-sm font-semibold transition shadow-sm">
                    📄 Download Resume
                  </a>
                </div>
              </div>
              <button onClick={() => setFullAppView(null)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="space-y-8">
                
                
                {fullAppView.ai_processed && (
                  <section>
                    <h4 className="text-lg font-bold text-[#2C5EAD] border-b-2 border-[#C4E2F5] pb-2 mb-4 flex items-center gap-2">
                      <span>🤖</span> AI Recruiter Evaluation
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-gray-700">Calculated Match Score</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-extrabold text-white ${
                          fullAppView.ai_match_score >= 80 ? 'bg-green-600' : 
                          fullAppView.ai_match_score >= 50 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}>
                          {fullAppView.ai_match_score} / 100
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-lg border border-gray-200 shadow-inner">
                        {fullAppView.ai_summary}
                      </div>
                    </div>
                  </section>
                )}

                <section>
                  <h4 className="text-lg font-bold text-[#2C5EAD] border-b-2 border-[#C4E2F5] pb-2 mb-4">Bio-Data</h4>
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 shadow-sm">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                      <div><dt className="text-gray-500 font-medium">Email</dt><dd className="font-semibold text-gray-900 break-all">{fullAppView.email}</dd></div>
                      <div><dt className="text-gray-500 font-medium">Mobile</dt><dd className="font-semibold text-gray-900">{fullAppView.mobile}</dd></div>
                      <div><dt className="text-gray-500 font-medium">Gender</dt><dd className="font-semibold text-gray-900">{fullAppView.gender}</dd></div>
                      <div><dt className="text-gray-500 font-medium">Date of Birth</dt><dd className="font-semibold text-gray-900">{fullAppView.dob}</dd></div>
                      <div><dt className="text-gray-500 font-medium">Location</dt><dd className="font-semibold text-gray-900">{fullAppView.location}</dd></div>
                      <div><dt className="text-gray-500 font-medium">Notice Period</dt><dd className="font-semibold text-gray-900">{fullAppView.notice_period}</dd></div>
                      <div className="sm:col-span-2"><dt className="text-gray-500 font-medium">Current Company</dt><dd className="font-semibold text-gray-900">{fullAppView.current_company}</dd></div>
                      <div className="sm:col-span-2"><dt className="text-gray-500 font-medium">Address</dt><dd className="font-semibold text-gray-900">{fullAppView.current_address}</dd></div>
                    </dl>
                  </div>
                </section>

                {fullAppView.cover_note && (
                  <section>
                    <h4 className="text-lg font-bold text-[#2C5EAD] border-b-2 border-[#C4E2F5] pb-2 mb-4">Cover Note</h4>
                    <div className="bg-[#C4E2F5] bg-opacity-30 rounded-lg p-5 border border-[#C4E2F5] text-gray-700 italic text-sm leading-relaxed whitespace-pre-line shadow-inner">
                      "{fullAppView.cover_note}"
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                <section>
                  <h4 className="text-lg font-bold text-[#2C5EAD] border-b-2 border-[#C4E2F5] pb-2 mb-4">Education</h4>
                  <div className="space-y-3">
                    {fullAppView.education?.map((edu, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm border-l-4 border-l-[#1591DC]">
                        <h5 className="font-bold text-gray-900">{edu.level} - {edu.degree} {edu.specialization && <span className="text-[#1591DC]">({edu.specialization})</span>}</h5>
                        <p className="text-sm text-gray-600 mt-1">{edu.institution}</p>
                        <div className="flex justify-between items-center mt-2 text-xs font-semibold text-gray-500 bg-gray-50 p-2 rounded">
                          <span>Class of {edu.year}</span>
                          <span>Grade: {edu.grade}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-lg font-bold text-[#2C5EAD] border-b-2 border-[#C4E2F5] pb-2 mb-4">Work Experience</h4>
                  <div className="space-y-3">
                    {fullAppView.experience_details?.length > 0 ? (
                      fullAppView.experience_details.map((exp, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm border-l-4 border-l-[#4BB8FA]">
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
                        <span className="text-gray-500 font-medium">Candidate applied as a Fresher.</span>
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