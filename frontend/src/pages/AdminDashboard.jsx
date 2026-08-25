

import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Sidebar from '../components/admin/Sidebar';
import JobRequisitions from '../components/admin/JobRequisitions';
import ApplicationsGrid from '../components/admin/ApplicationsGrid';
import AdminNotifications from '../components/admin/AdminNotifications'; // We will create this next

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('jobs');

  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Right Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'jobs' && <JobRequisitions />}
          {activeTab === 'applications' && <ApplicationsGrid />}
          {activeTab === 'notifications' && <AdminNotifications />}
        </div>
      </div>
      
    </div>
  );
}