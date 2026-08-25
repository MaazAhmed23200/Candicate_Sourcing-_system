
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PublicRoute({ children }) {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');

  // If the user is already logged in, push them away from the login/register pages
  if (token) {
    if (role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/candidate-dashboard" replace />;
    }
  }

  // If not logged in, allow them to see the login/register page
  return children;
}