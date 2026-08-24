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

  // Step 4: Register with KYC files and save in MySQL
  register: (formData) => client.post('/auth/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // Login
  login: (identifier, password) => client.post('/auth/login', { identifier, password }),

  // Get Current User Profile
  getCurrentUser: () => client.get('/auth/me'),

  // Categories & Products
  getCategories: () => client.get('/categories'),
  getProducts: (params) => client.get('/products', { params }),
};

export default client;
