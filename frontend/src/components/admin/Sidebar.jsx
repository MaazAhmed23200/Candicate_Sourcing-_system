import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Sidebar({ activeTab, setActiveTab }) {
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications to get the unread badge count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get('http://localhost:8000/api/admin/notifications/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const count = res.data.filter(n => !n.is_read).length;
        setUnreadCount(count);
      } catch (err) {
        console.error("Could not fetch notification count");
      }
    };
    fetchCount();
    // Refresh count every 30 seconds
    const interval = setInterval(fetchCount, 30000); 
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'jobs', label: 'Job Requisitions', icon: '💼' },
    { id: 'applications', label: 'Applications', icon: '📄' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  return (
    <div className="w-64 bg-[#2C5EAD] text-white shadow-xl flex flex-col hidden md:flex">
      <div className="p-6 border-b border-blue-800">
        <h2 className="text-2xl font-extrabold tracking-wide">
          Talent Bridge <span className="text-[#4BB8FA]">Admin</span>
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-lg font-bold transition duration-200 ${
              activeTab === item.id 
                ? 'bg-[#1591DC] shadow-md text-white' 
                : 'text-blue-100 hover:bg-[#4BB8FA] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            
            {/* Unread Badge Logic */}
            {item.id === 'notifications' && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <p className="text-xs text-blue-200 text-center font-semibold">Logged in as Administrator</p>
      </div>
    </div>
  );
}