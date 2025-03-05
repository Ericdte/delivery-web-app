import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import './MyOrders.css';

function MyOrders() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!currentUser) {
          throw new Error('User not authenticated');
        }

        console.log('Starting to fetch orders...');
        console.log('Current user:', currentUser.uid);
        const ordersRef = collection(db, 'orders');
        
        // First try a simple query without ordering
        console.log('Trying simple query first...');
        const simpleQuery = query(
          ordersRef,
          where('userId', '==', currentUser.uid)
        );
        
        const simpleSnapshot = await getDocs(simpleQuery);
        console.log('Simple query successful! Found orders:', simpleSnapshot.size);

        // If simple query works, try the ordered query
        console.log('Now trying ordered query...');
        const orderedQuery = query(
          ordersRef,
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(orderedQuery);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('Ordered query successful! Found orders:', ordersData.length);
        setOrders(ordersData);
      } catch (err) {
        console.error('Detailed error information:');
        console.error('Error code:', err.code);
        console.error('Error message:', err.message);
        console.error('Full error object:', err);
        
        if (err.code === 'failed-precondition') {
          setError('Please wait a few minutes and try again. The database is updating.');
        } else if (err.code === 'permission-denied') {
          setError('You do not have permission to view these orders.');
        } else {
          setError(`Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#f39c12';
      case 'processing':
        return '#3498db';
      case 'delivered':
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <div className="orders-header">
        <h2>My Orders</h2>
        <button 
          className="new-order-btn"
          onClick={() => navigate('/order')}
        >
          Place New Order
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <button 
            className="new-order-btn"
            onClick={() => navigate('/order')}
          >
            Place Your First Order
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <strong>Order ID:</strong> {order.id}
                </div>
                <div 
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </div>
              </div>
              
              <div className="order-info">
                <div className="info-row">
                  <span><strong>Created:</strong> {order.createdAt?.toDate().toLocaleString()}</span>
                  <span><strong>Region:</strong> {order.region}</span>
                </div>
                
                <div className="info-row">
                  <span><strong>From:</strong> {order.pickupAddress.address}</span>
                  <span><strong>To:</strong> {order.deliveryAddress.address}</span>
                </div>

                <div className="info-row">
                  <span><strong>Package:</strong> {order.packageDetails.size}</span>
                  <span><strong>Type:</strong> {order.deliveryType}</span>
                </div>
              </div>

              <div className="order-actions">
                <button 
                  className="view-details-btn"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders; 