import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to headers
apiClient.interceptors.request.use((config) => {
  console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Log responses and errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  farmerRegister: (data: any) => apiClient.post('/auth/farmer/register', data),
  farmerLogin: (data: any) => apiClient.post('/auth/farmer/login', data),
};

// Cow APIs
export const cowAPI = {
  registerNewborn: (data: any) => apiClient.post('/cows/register/newborn', data),
  registerPurchased: (data: any) => apiClient.post('/cows/register/purchased', data),
  getMyCows: () => apiClient.get('/cows/my-cows'),
  getCowDetail: (cowId: string) => apiClient.get(`/cows/${cowId}`),
  addBiometric: (cowId: string, data: any) => apiClient.post(`/cows/${cowId}/add-biometric`, data),
  uploadDNA: (cowId: string, data: any) => apiClient.post(`/cows/${cowId}/upload-dna`, data),
  getMatingRecommendations: (cowId: string) => apiClient.get(`/cows/${cowId}/mating-recommendations`),
  getAllAvailableBulls: () => apiClient.get('/cows/mating/available-bulls'),
  calculateCompatibility: (cowId: string, bullId: string) => apiClient.get(`/cows/${cowId}/compatibility/${bullId}`),
};

// Vaccination APIs
export const vaccinationAPI = {
  addVaccination: (cowId: string, data: any) => apiClient.post(`/cows/${cowId}/vaccinations`, data),
  getHistory: (cowId: string) => apiClient.get(`/cows/${cowId}/vaccinations`),
  getUpcoming: () => apiClient.get('/cows/vaccinations/upcoming/all'),
};

export default apiClient;
