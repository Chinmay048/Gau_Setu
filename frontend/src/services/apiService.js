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
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  farmerRegister: (data) => apiClient.post('/auth/farmer/register', data),
  farmerLogin: (data) => apiClient.post('/auth/farmer/login', data),
  vetRegister: (data) => apiClient.post('/auth/vet/register', data),
  vetLogin: (data) => apiClient.post('/auth/vet/login', data),
};

// Cow APIs
export const cowAPI = {
  registerNewborn: (data) => apiClient.post('/cows/register/newborn', data),
  registerPurchased: (data) => apiClient.post('/cows/register/purchased', data),
  getMyCows: () => apiClient.get('/cows/my-cows'),
  getCowDetail: (cowId) => apiClient.get(`/cows/${cowId}`),
  updateCowDNA: (cowId, data) => apiClient.put(`/cows/${cowId}/dna-status`, data),
};

// Vaccination APIs
export const vaccinationAPI = {
  addVaccination: (data) => apiClient.post('/vaccinations', data),
  getHistory: (cowId) => apiClient.get(`/vaccinations/${cowId}/history`),
  getUpcoming: (cowId) => apiClient.get(`/vaccinations/${cowId}/upcoming`),
  verifyVaccination: (vaccinationId) => apiClient.put(`/vaccinations/${vaccinationId}/verify`),
};

// Vet APIs
export const vetAPI = {
  searchCow: (cowId) => apiClient.get(`/vet/cow/search/${cowId}`),
  createReport: (data) => apiClient.post('/vet/report/create', data),
  submitReport: (reportId, data) => apiClient.put(`/vet/report/${reportId}/submit`, data),
  getHealthReports: (cowId) => apiClient.get(`/vet/report/cow/${cowId}`),
  getMyReports: () => apiClient.get('/vet/reports/my-submissions'),
};

// Transfer APIs
export const transferAPI = {
  initiateTransfer: (data) => apiClient.post('/transfers/initiate', data),
  completeTransfer: (transferId) => apiClient.put(`/transfers/${transferId}/complete`),
  getPendingTransfers: () => apiClient.get('/transfers/pending'),
};

export default apiClient;
