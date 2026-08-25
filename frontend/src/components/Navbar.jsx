




import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

export default function Navbar() {
  const navigate = useNavigate();
  
 
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role'); // e.g., 'ADMIN' or 'CANDIDATE'

  // 2. Set the dynamic link based on the role
  const dashboardLink = role === 'ADMIN' ? '/admin' : '/candidate-dashboard'; 
  // (Note: update '/admin' to whatever your actual admin route is, like '/admin-dashboard')

  const handleLogout = () => {
    Swal.fire({
      title: 'Ready to leave?',
      text: "You will be logged out of your account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2C5EAD', 
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log me out'
    }).then((result) => {
      if (result.isConfirmed) {
        // 3. Clear BOTH the token and the role on logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token'); 
        localStorage.removeItem('role'); 
        
        toast.success("Successfully logged out.");
        navigate('/login');
      }
    });
  };

  return (
    <nav className="bg-[#2C5EAD] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Section */}
          <Link to="/" className="flex-shrink-0 font-bold text-xl tracking-wide">
            Talent Bridge <span className="text-[#4BB8FA]">Careers</span>
          </Link>
          
          {/* Right Side Links */}
          <div className="flex space-x-4 items-center">
            <Link to="/" className="hover:text-[#C4E2F5] transition duration-200 font-medium hidden sm:block">
              Browse Jobs
            </Link>

            {/* Conditional Rendering based on Login Status */}
            {token ? (
              <>
                {/* 4. Use the dynamic dashboardLink here */}
                <Link to={dashboardLink} className="hover:text-[#C4E2F5] transition duration-200 font-medium">
                  My Dashboard
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="bg-[#1591DC] hover:bg-[#4BB8FA] text-white px-4 py-2 rounded-md font-medium transition duration-200 shadow"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-[#C4E2F5] transition duration-200 font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-[#1591DC] hover:bg-[#4BB8FA] text-white px-4 py-2 rounded-md font-medium transition duration-200 shadow">
                  Register
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}