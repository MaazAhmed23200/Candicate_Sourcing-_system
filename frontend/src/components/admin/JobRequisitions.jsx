




import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

export default function JobRequisitions() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialFormState = {
    title: '', department: '', location: '', employment_type: 'Full-time',
    experience_range: '', openings: 1, hiring_manager: '', job_description: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const token = localStorage.getItem('access_token');
  const apiConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchJobs = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/admin/jobs/', apiConfig);
      setJobs(res.data);
    } catch (err) {
      toast.error("Failed to load jobs. Are you logged in as Admin?");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSubmit = async (status) => {
    const payload = { ...formData, status };
    try {
      if (editingId) {
        await axios.put(`http://localhost:8000/api/admin/jobs/${editingId}/`, payload, apiConfig);
        toast.success("Job updated successfully.");
      } else {
        await axios.post('http://localhost:8000/api/admin/jobs/', payload, apiConfig);
        toast.success("Job created successfully.");
      }
      setFormData(initialFormState);
      setShowForm(false);
      setEditingId(null);
      fetchJobs();
    } catch (err) {
      toast.error("Error saving requisition.");
    }
  };

  const handleEdit = (job) => {
    setFormData(job);
    setEditingId(job.id);
    setShowForm(true);
  };

  const handleClose = async (id) => {
    const result = await Swal.fire({
      title: 'Close this requisition?',
      text: "Candidates will no longer be able to apply for this job.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#2C5EAD',
      confirmButtonText: 'Yes, close it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(`http://localhost:8000/api/admin/jobs/${id}/`, { status: 'CLOSED' }, apiConfig);
        toast.success("Job closed successfully.");
        fetchJobs();
      } catch (err) {
        toast.error("Failed to close job.");
      }
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await axios.post(`http://localhost:8000/api/admin/jobs/${id}/duplicate/`, {}, apiConfig);
      toast.success("Job duplicated successfully. Saved as Draft.");
      fetchJobs();
    } catch (err) {
      toast.error("Failed to duplicate job.");
    }
  };

  // NEW: Delete Job Function (Only available for CLOSED jobs)
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete this requisition?',
      text: "This action cannot be undone. Are you sure you want to permanently delete this closed job?",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#2C5EAD',
      confirmButtonText: 'Yes, permanently delete!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8000/api/admin/jobs/${id}/`, apiConfig);
        toast.success("Job deleted successfully.");
        fetchJobs();
      } catch (err) {
        toast.error("Failed to delete job.");
      }
    }
  };

  const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4BB8FA] outline-none transition";

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4 gap-4">
        <h2 className="text-2xl font-extrabold text-[#2C5EAD]">Manage Requisitions</h2>
        <button 
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(initialFormState); }} 
          className={`font-bold py-2.5 px-6 rounded-lg transition duration-200 shadow-sm ${showForm ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-[#1591DC] hover:bg-[#2C5EAD] text-white'}`}
        >
          {showForm ? 'Cancel' : '+ Create Requisition'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 mb-8 rounded-xl shadow-sm animate-fadeIn">
          <h3 className="text-xl font-bold text-[#2C5EAD] mb-6 border-b-2 border-[#C4E2F5] pb-2 inline-block">
            {editingId ? 'Edit Requisition' : 'New Requisition'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Job Title *</label><input placeholder="e.g. Senior Software Engineer" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputClass} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Department *</label><input placeholder="e.g. Engineering" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className={inputClass} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Location *</label><input placeholder="e.g. Remote, New York" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className={inputClass} /></div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Employment Type *</label>
              <select value={formData.employment_type} onChange={e => setFormData({...formData, employment_type: e.target.value})} className={inputClass}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div><label className="block text-sm font-bold text-gray-700 mb-1">Experience Range *</label><input placeholder="e.g. 2-5 years" value={formData.experience_range} onChange={e => setFormData({...formData, experience_range: e.target.value})} className={inputClass} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Openings *</label><input type="number" min="1" value={formData.openings} onChange={e => setFormData({...formData, openings: e.target.value})} className={inputClass} /></div>
            <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1">Hiring Manager *</label><input placeholder="Name of Manager" value={formData.hiring_manager} onChange={e => setFormData({...formData, hiring_manager: e.target.value})} className={inputClass} /></div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-1">Job Description & Requirements *</label>
            <textarea placeholder="List responsibilities, requirements, and benefits..." value={formData.job_description} onChange={e => setFormData({...formData, job_description: e.target.value})} className={`${inputClass} h-32 resize-none`} />
          </div>
          
          <div className="flex gap-4">
            <button onClick={() => handleSubmit('PUBLISHED')} className="bg-[#28a745] hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg transition duration-200 shadow-sm">
              Publish to Career Site
            </button>
            <button onClick={() => handleSubmit('DRAFT')} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-lg transition duration-200">
              Save as Draft
            </button>
          </div>
        </div>
      )}

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#C4E2F5]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Req ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Job Title</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Applicants</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-[#2C5EAD] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-medium">No requisitions found.</td></tr>
            ) : (
              jobs.map(job => (
                <tr key={job.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{job.req_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{job.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border
                      ${job.status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border-green-200' : 
                        job.status === 'CLOSED' ? 'bg-red-50 text-red-700 border-red-200' : 
                        'bg-gray-100 text-gray-700 border-gray-300'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-bold text-center">
                    <span className="bg-[#C4E2F5] text-[#2C5EAD] py-1 px-3 rounded-full">
                      {job.application_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-center gap-2">
                    <button onClick={() => handleEdit(job)} className="text-[#1591DC] hover:text-white hover:bg-[#1591DC] bg-blue-50 px-3 py-1.5 rounded transition">Edit</button>
                    <button onClick={() => handleDuplicate(job.id)} className="text-gray-600 hover:text-white hover:bg-gray-600 bg-gray-100 px-3 py-1.5 rounded transition">Duplicate</button>
                    
                    {/* Render "Close" if not closed, otherwise render "Delete" */}
                    {job.status !== 'CLOSED' ? (
                      <button onClick={() => handleClose(job.id)} className="text-yellow-600 hover:text-white hover:bg-yellow-500 bg-yellow-50 px-3 py-1.5 rounded transition">Close</button>
                    ) : (
                      <button onClick={() => handleDelete(job.id)} className="text-red-600 hover:text-white hover:bg-red-600 bg-red-50 px-3 py-1.5 rounded transition font-bold">Delete</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}