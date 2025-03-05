import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-actions">
        <Link to="/order" className="dashboard-button">
          Place New Order
        </Link>
        <Link to="/my-orders" className="dashboard-button">
          My Orders
        </Link>
        <button onClick={handleLogout} className="dashboard-button">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard; 