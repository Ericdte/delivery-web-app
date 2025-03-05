import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './OrderDetails.css';

function OrderDetails() {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!currentUser) {
          throw new Error('User not authenticated');
        }

        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
          throw new Error('Order not found');
        }

        const orderData = orderSnap.data();
        
        // Check if the order belongs to the current user
        if (orderData.userId !== currentUser.uid) {
          throw new Error('You do not have permission to view this order');
        }

        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, currentUser]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="error-container">
        <h2>Order Not Found</h2>
        <p>The order you're looking for doesn't exist.</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="order-details">
      <h2>Order Details</h2>
      <div className="order-info">
        <div className="info-section">
          <h3>Order Information</h3>
          <p><strong>Order ID:</strong> {orderId}</p>
          <p><strong>Status:</strong> <span className={`status-${order.status}`}>{order.status}</span></p>
          <p><strong>Created:</strong> {order.createdAt?.toDate().toLocaleString()}</p>
          <p><strong>Last Updated:</strong> {order.updatedAt?.toDate().toLocaleString()}</p>
        </div>

        <div className="info-section">
          <h3>Pickup Details</h3>
          <p><strong>Region:</strong> {order.region}</p>
          <p><strong>Address:</strong> {order.pickupAddress.address}</p>
          <p><strong>Phone:</strong> {order.pickupAddress.phone}</p>
          <p><strong>Landmark:</strong> {order.pickupAddress.landmark}</p>
          {order.pickupAddress.instructions && (
            <p><strong>Instructions:</strong> {order.pickupAddress.instructions}</p>
          )}
        </div>

        <div className="info-section">
          <h3>Delivery Details</h3>
          <p><strong>Address:</strong> {order.deliveryAddress.address}</p>
          <p><strong>Phone:</strong> {order.deliveryAddress.phone}</p>
          <p><strong>Landmark:</strong> {order.deliveryAddress.landmark}</p>
          {order.deliveryAddress.instructions && (
            <p><strong>Instructions:</strong> {order.deliveryAddress.instructions}</p>
          )}
        </div>

        <div className="info-section">
          <h3>Package Details</h3>
          <p><strong>Size:</strong> {order.packageDetails.size}</p>
          <p><strong>Category:</strong> {order.packageDetails.category}</p>
          <p><strong>Description:</strong> {order.packageDetails.description}</p>
          <p><strong>Value:</strong> {order.packageDetails.value}</p>
        </div>

        <div className="info-section">
          <h3>Delivery Information</h3>
          <p><strong>Type:</strong> {order.deliveryType}</p>
          <p><strong>Preferred Date:</strong> {order.preferredDeliveryDate}</p>
          <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
        </div>
      </div>
      <button onClick={() => window.history.back()} className="back-button">
        Go Back
      </button>
    </div>
  );
}

export default OrderDetails; 