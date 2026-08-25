




import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import the Navbar and Route Protectors
import Navbar from './components/Navbar'; 
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Import all your page components
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import PublicJobs from './pages/PublicJobs';
import JobDetail from './pages/JobDetail';
import ApplyFlow from './pages/ApplyFlow';
import ResetPassword from './pages/ResetPassword';

export default function App() {
  return (
    <BrowserRouter>
      {/* Navbar sits outside Routes so it renders on every page */}
      <Navbar /> 
      
      <Routes>
        {/* PUBLIC ROUTES (Hidden from logged-in users) */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* PROTECTED ADMIN ROUTE */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* PROTECTED CANDIDATE ROUTE */}
        <Route path="/candidate-dashboard" element={
          <ProtectedRoute allowedRoles={['CANDIDATE']}>
            <CandidateDashboard />
          </ProtectedRoute>
        } />

        {/* OPEN ROUTES (Visible to everyone) */}
        <Route path="/" element={<PublicJobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        
        {/* Note: You might want to protect ApplyFlow too! */}
        <Route path="/apply/:id" element={
          <ProtectedRoute allowedRoles={['CANDIDATE']}>
            <ApplyFlow />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}