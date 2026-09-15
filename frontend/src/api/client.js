import axios from 'axios';

const API_BASE_URL = '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Bearer token automatically if available
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('renthub_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Step 2: Send OTP to Phone & Email
  sendOtp: (phoneNumber, email) => client.post('/auth/send-otp', { phoneNumber, email }),

  // Step 2: Verify OTP
  verifyOtp: (phoneNumber, otp) => client.post('/auth/verify-otp', { phoneNumber, otp }),

  // Step 3: Real Aadhaar Document-to-Input OCR Verification
  verifyAadhaarOcr: (formData) => client.post('/auth/verify-aadhaar-ocr', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // Step 4: Register with KYC files and save in MySQL
  register: (formData) => client.post('/auth/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // Login
  login: (identifier, password) => client.post('/auth/login', { identifier, password }),

  // Current User Profile (Auth)
  getCurrentUser: () => client.get('/auth/me'),

  // User Profile APIs (REST)
  getUserProfile: () => client.get('/users/profile'),
  updateUserProfile: (data) => client.put('/users/profile', data),
  uploadProfilePhoto: (formData) => client.post('/users/profile/photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getUserStatistics: () => client.get('/users/profile/statistics'),

  // KYC Verification APIs
  uploadKycDocument: (formData) => client.post('/kyc/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getKycStatus: () => client.get('/kyc/status'),

  // Categories & Products
  getCategories: () => client.get('/categories'),
  getProducts: (params) => client.get('/products', { params }),

  // Product Condition AI Scanner (Camera & Photos)
  scanSinglePhoto: (formData) => client.post('/condition-scan/photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  scanCombinedFinal: (formData) => client.post('/condition-scan/final', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  scanProductCondition: (formData) => client.post('/condition-scan', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // Resources / Give For Rent / Owner Product Management
  createResource: (formData) => client.post('/resources', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getResources: () => client.get('/resources'),
  getResourceById: (id) => client.get(`/resources/${id}`),
  getMyProducts: () => client.get('/resources/my-products'),
  updateResource: (id, data) => client.put(`/resources/${id}`, data),
  addProductImage: (id, formData) => client.post(`/resources/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteProductImage: (id, imageId) => client.delete(`/resources/${id}/images/${imageId}`),
  getConditionHistory: (id) => client.get(`/resources/${id}/condition-history`),

  // Orders / Rental Requests / Returns / Cancellations
  createOrder: (orderData) => client.post('/orders', orderData),
  getMyOrders: () => client.get('/orders/my-orders'),
  getReceivedOrders: () => client.get('/orders/received'),
  acceptOrder: (orderId) => client.put(`/orders/${orderId}/accept`),
  rejectOrder: (orderId) => client.put(`/orders/${orderId}/reject`),
  cancelOrderByCustomer: (orderId) => client.put(`/orders/${orderId}/cancel-customer`),
  cancelOrderByVendor: (orderId) => client.put(`/orders/${orderId}/cancel-vendor`),
  requestReturn: (orderId, data) => client.post(`/orders/${orderId}/request-return`, data),

  // Return Inspection & Management
  getOwnerPendingReturns: () => client.get('/returns/owner'),
  getReturnOrder: (orderId) => client.get(`/returns/${orderId}`),
  scanReturnedProduct: (orderId, formData) => client.post(`/returns/${orderId}/scan`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  confirmReturn: (orderId) => client.post(`/returns/${orderId}/confirm`),
  reportDamage: (orderId, data) => client.post(`/returns/${orderId}/report-damage`, data),

  // Notifications
  getNotifications: () => client.get('/notifications'),
  getUnreadCount: () => client.get('/notifications/unread-count'),
  markNotificationAsRead: (id) => client.put(`/notifications/${id}/read`),
  markAllNotificationsAsRead: () => client.put('/notifications/read-all'),
};

export default client;
