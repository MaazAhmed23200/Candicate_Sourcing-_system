
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');

  // 1. If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. If the user's role isn't allowed on this route, redirect them to their correct dashboard
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/candidate-dashboard" replace />;
    }
  }

  // 3. If everything is good, render the protected page
  return children;
}