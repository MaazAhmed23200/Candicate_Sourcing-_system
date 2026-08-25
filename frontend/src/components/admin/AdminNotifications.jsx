import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await axios.get('http://localhost:8000/api/admin/notifications/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      toast.error("Failed to load notifications.");
    }
  };

  const markNotificationsRead = async () => {
    const token = localStorage.getItem('access_token');
    try {
      await axios.post('http://localhost:8000/api/admin/notifications/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success("Notifications marked as read.");
    } catch (err) {
      toast.error("Failed to update notifications.");
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 min-h-[500px]">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-extrabold text-[#2C5EAD]">System Notifications</h2>
        {unreadCount > 0 && (
          <button 
            onClick={markNotificationsRead}
            className="text-sm bg-[#C4E2F5] hover:bg-[#4BB8FA] hover:text-white text-[#2C5EAD] font-bold py-2 px-4 rounded-lg transition duration-200 shadow-sm"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <p className="text-gray-500 font-medium">You're all caught up! No new notifications.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`p-5 rounded-lg border-l-4 shadow-sm transition duration-200 ${notif.is_read ? 'bg-white border-gray-300' : 'bg-[#C4E2F5] bg-opacity-20 border-[#1591DC]'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  {!notif.is_read && <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-[#1591DC] shadow animate-pulse shrink-0"></div>}
                  <p className={`text-sm md:text-base ${notif.is_read ? 'text-gray-600' : 'text-gray-900 font-bold'}`}>
                    {notif.message}
                  </p>
                </div>
                <span className="text-xs font-semibold text-gray-400 whitespace-nowrap ml-4 bg-gray-100 px-2 py-1 rounded">
                  {notif.created_at}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}