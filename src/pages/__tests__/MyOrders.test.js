import React from 'react';
import { render, screen, waitFor } from '../test-utils';
import MyOrders from '../MyOrders';
import { db } from '../../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

// Mock Firebase
jest.mock('../../firebase', () => ({
  db: {
    collection: jest.fn(),
  },
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
}));

describe('MyOrders Component', () => {
  const mockOrders = [
    {
      id: '1',
      status: 'pending',
      createdAt: { toDate: () => new Date() },
      region: 'North',
      pickupAddress: { address: '123 Pickup St' },
      deliveryAddress: { address: '456 Delivery Ave' },
      packageDetails: { size: 'Medium' },
      deliveryType: 'Standard',
    },
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock successful Firestore query
    getDocs.mockResolvedValue({
      docs: mockOrders.map(order => ({
        id: order.id,
        data: () => order,
      })),
    });
  });

  test('renders loading state initially', () => {
    render(<MyOrders />);
    expect(screen.getByText('Loading your orders...')).toBeInTheDocument();
  });

  test('renders empty state when no orders', async () => {
    getDocs.mockResolvedValue({ docs: [] });
    
    render(<MyOrders />);
    
    await waitFor(() => {
      expect(screen.getByText('You haven\'t placed any orders yet.')).toBeInTheDocument();
      expect(screen.getByText('Place Your First Order')).toBeInTheDocument();
    });
  });

  test('renders orders list when orders exist', async () => {
    render(<MyOrders />);
    
    await waitFor(() => {
      // Check if order details are displayed
      expect(screen.getByText('Order ID: 1')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('North')).toBeInTheDocument();
      expect(screen.getByText('123 Pickup St')).toBeInTheDocument();
      expect(screen.getByText('456 Delivery Ave')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
    });
  });

  test('renders error state when Firestore query fails', async () => {
    getDocs.mockRejectedValue(new Error('Failed to fetch orders'));
    
    render(<MyOrders />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error/)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  test('navigates to new order page when clicking Place New Order', async () => {
    const { container } = render(<MyOrders />);
    
    await waitFor(() => {
      const newOrderButton = screen.getByText('Place New Order');
      expect(newOrderButton).toBeInTheDocument();
    });
    
    // Note: Navigation testing would require additional setup with react-router
    // This is just a basic check that the button exists
  });
}); 