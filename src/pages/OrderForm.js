import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './OrderForm.css';

function OrderForm() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [formData, setFormData] = useState({
    pickupAddress: {
      address: '',
      phone: '',
      instructions: '',
      landmark: ''
    },
    deliveryAddress: {
      address: '',
      phone: '',
      instructions: '',
      landmark: ''
    },
    packageDetails: {
      size: 'small',
      description: '',
      category: 'general',
      value: ''
    },
    deliveryType: 'standard',
    preferredDeliveryDate: '',
    paymentMethod: 'cash',
    region: 'douala'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Starting order submission...');
    console.log('Current user state:', currentUser);
    console.log('Loading state:', loading);
    console.log('Error state:', error);
    console.log('Success state:', success);
    
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!currentUser) {
        console.error('No user logged in');
        throw new Error('No user logged in');
      }
      
      console.log('Current user:', currentUser);
      console.log('Form data:', formData);

      const orderData = {
        ...formData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Prepared order data:', orderData);
      console.log('Attempting to save to Firestore...');
      console.log('Firestore db object:', db);

      // Test Firestore connection
      try {
        const ordersCollection = collection(db, 'orders');
        console.log('Successfully got orders collection');
        
        const docRef = await addDoc(ordersCollection, orderData);
        console.log('Order created successfully with ID:', docRef.id);
        setOrderId(docRef.id);
        setSuccess(true);
      } catch (firestoreError) {
        console.error('Firestore specific error:', firestoreError);
        console.error('Firestore error code:', firestoreError.code);
        console.error('Firestore error message:', firestoreError.message);
        throw firestoreError;
      }
      
      // Reset form after successful submission
      setFormData({
        pickupAddress: {
          address: '',
          phone: '',
          instructions: '',
          landmark: ''
        },
        deliveryAddress: {
          address: '',
          phone: '',
          instructions: '',
          landmark: ''
        },
        packageDetails: {
          size: 'small',
          description: '',
          category: 'general',
          value: ''
        },
        deliveryType: 'standard',
        preferredDeliveryDate: '',
        paymentMethod: 'cash',
        region: 'douala'
      });

      console.log('Form reset successfully');
    } catch (error) {
      console.error('Detailed error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setError(`Failed to create order: ${error.message}`);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  return (
    <div className="order-form-container">
      <h2>Place New Order</h2>
      {error && <p className="error">{error}</p>}
      {success && (
        <div className="success-message">
          <p>Order placed successfully!</p>
          <p>Order ID: {orderId}</p>
          <p>Submitted on: {new Date().toLocaleString()}</p>
          <button 
            onClick={() => navigate(`/orders/${orderId}`)}
            className="view-order-btn"
          >
            View Order Details
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-section">
          <h3>Pickup Details</h3>
          <select
            name="region"
            value={formData.region}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="douala">Douala</option>
            <option value="yaounde">Yaoundé</option>
            <option value="bamenda">Bamenda</option>
            <option value="bafoussam">Bafoussam</option>
            <option value="garoua">Garoua</option>
            <option value="maroua">Maroua</option>
            <option value="ngaoundere">Ngaoundéré</option>
            <option value="bertoua">Bertoua</option>
            <option value="kumba">Kumba</option>
            <option value="limbe">Limbé</option>
          </select>
          <input
            type="text"
            name="pickupAddress.address"
            placeholder="Pickup Address"
            value={formData.pickupAddress.address}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="tel"
            name="pickupAddress.phone"
            placeholder="Pickup Phone Number (e.g., +237 6XX XXX XXX)"
            value={formData.pickupAddress.phone}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="text"
            name="pickupAddress.landmark"
            placeholder="Landmark (e.g., Near Total Station, Behind Market)"
            value={formData.pickupAddress.landmark}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <textarea
            name="pickupAddress.instructions"
            placeholder="Pickup Instructions"
            value={formData.pickupAddress.instructions}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-section">
          <h3>Delivery Details</h3>
          <input
            type="text"
            name="deliveryAddress.address"
            placeholder="Delivery Address"
            value={formData.deliveryAddress.address}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="tel"
            name="deliveryAddress.phone"
            placeholder="Recipient Phone Number (e.g., +237 6XX XXX XXX)"
            value={formData.deliveryAddress.phone}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="text"
            name="deliveryAddress.landmark"
            placeholder="Landmark (e.g., Near Total Station, Behind Market)"
            value={formData.deliveryAddress.landmark}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <textarea
            name="deliveryAddress.instructions"
            placeholder="Delivery Instructions"
            value={formData.deliveryAddress.instructions}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-section">
          <h3>Package Details</h3>
          <select
            name="packageDetails.category"
            value={formData.packageDetails.category}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="general">General Package</option>
            <option value="food">Food Items</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="documents">Documents</option>
            <option value="fragile">Fragile Items</option>
          </select>
          <select
            name="packageDetails.size"
            value={formData.packageDetails.size}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="small">Small Package (Up to 5kg)</option>
            <option value="medium">Medium Package (5-15kg)</option>
            <option value="large">Large Package (15kg+)</option>
          </select>
          <input
            type="number"
            name="packageDetails.value"
            placeholder="Package Value (FCFA)"
            value={formData.packageDetails.value}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <textarea
            name="packageDetails.description"
            placeholder="Package Description"
            value={formData.packageDetails.description}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-section">
          <h3>Delivery Options</h3>
          <select
            name="deliveryType"
            value={formData.deliveryType}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="standard">Standard Delivery (24-48 hours)</option>
            <option value="express">Express Delivery (Same day)</option>
            <option value="scheduled">Scheduled Delivery</option>
          </select>
          <input
            type="date"
            name="preferredDeliveryDate"
            value={formData.preferredDeliveryDate}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="cash">Cash on Delivery</option>
            <option value="mobile_money">Mobile Money (MTN, Orange, etc.)</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}

export default OrderForm; 