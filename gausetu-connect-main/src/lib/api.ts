import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-steel-two-36.vercel.app/api';

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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────
export const authAPI = {
  farmerRegister: (data: any) => apiClient.post('/auth/farmer/register', data),
  farmerLogin: (data: any) => apiClient.post('/auth/farmer/login', data),
  otpSend: (phoneNumber: string) => apiClient.post('/auth/otp/send', { phoneNumber }),
  otpVerify: (phoneNumber: string, otp: string) => apiClient.post('/auth/otp/verify', { phoneNumber, otp }),
  vetLogin: (data: any) => apiClient.post('/auth/vet/login', data),
  vetRegister: (data: any) => apiClient.post('/auth/vet/register', data),
  govLogin: (data: any) => apiClient.post('/auth/government/login', data),
  getProfile: () => apiClient.get('/auth/profile'),
};

// ─── Cows ────────────────────────────────────────────────
export const cowAPI = {
  registerNewborn: (data: any) => apiClient.post('/cows/register/newborn', data),
  registerPurchased: (data: any) => apiClient.post('/cows/register/purchased', data),
  getMyCows: () => apiClient.get('/cows/my-cows'),
  getCowDetail: (cowId: string) => apiClient.get(`/cows/${cowId}`),
  search: (query: string) => apiClient.get(`/cows/search?query=${encodeURIComponent(query)}`),
  addBiometric: (cowId: string, data: any) => apiClient.post(`/cows/${cowId}/add-biometric`, data),
  updateDNA: (cowId: string, data: any) => apiClient.put(`/cows/${cowId}/dna-status`, data),
  uploadDNA: (cowId: string, data: any) => apiClient.post(`/cows/${cowId}/upload-dna`, data),
  reportRFIDLost: (cowId: string) => apiClient.put(`/cows/${cowId}/rfid/lost`),
  replaceRFID: (cowId: string, newRfidNumber: string) => apiClient.put(`/cows/${cowId}/rfid/replace`, { newRfidNumber }),
  getMatingRecommendations: (cowId: string) => apiClient.get(`/cows/${cowId}/mating-recommendations`),
  getAllAvailableBulls: () => apiClient.get('/cows/mating/available-bulls'),
};

// ─── Vaccinations ────────────────────────────────────────
export const vaccinationAPI = {
  addVaccination: (cowId: string, data: any) => apiClient.post(`/cows/${cowId}/vaccinations`, data),
  getHistory: (cowId: string) => apiClient.get(`/cows/${cowId}/vaccinations`),
  getUpcoming: () => apiClient.get('/cows/vaccinations/upcoming/all'),
  getCalendar: (cowId: string) => apiClient.get(`/cows/${cowId}/vaccination-calendar`),
  getSummary: () => apiClient.get('/cows/vaccinations/summary'),
};

// ─── Vet ─────────────────────────────────────────────────
export const vetAPI = {
  createReport: (data: any) => apiClient.post('/vet/reports', data),
  submitReport: (reportId: string) => apiClient.put(`/vet/reports/${reportId}/submit`),
  getMyReports: () => apiClient.get('/vet/reports/my'),
  getReportsByCow: (cowId: string) => apiClient.get(`/vet/reports/cow/${cowId}`),
  uploadDNAVerification: (data: any) => apiClient.post('/vet/dna-verification', data),
  verifyVaccination: (vaccinationId: string) => apiClient.put(`/vet/vaccinations/${vaccinationId}/verify`),
};

// ─── Government ──────────────────────────────────────────
export const governmentAPI = {
  getDashboard: (region?: string) => apiClient.get('/government/dashboard', { params: { region } }),
  getRegionalStats: (region?: string) => apiClient.get('/government/stats/regional', { params: { region } }),
  getBreedStats: (region?: string) => apiClient.get('/government/stats/breeds', { params: { region } }),
  getVaccinationCoverage: (region?: string) => apiClient.get('/government/stats/vaccination-coverage', { params: { region } }),
  getDiseaseAlerts: (region?: string) => apiClient.get('/government/disease-alerts', { params: { region } }),
  createDiseaseAlert: (data: any) => apiClient.post('/government/disease-alerts', data),
};

// ─── Breeding ────────────────────────────────────────────
export const breedingAPI = {
  getRecommendations: (cowId: string) => apiClient.get(`/breeding/${cowId}/recommendations`),
  getGenetics: (cowId: string) => apiClient.get(`/breeding/${cowId}/genetics`),
};

// ─── Milk ────────────────────────────────────────────────
export const milkAPI = {
  logProduction: (data: any) => apiClient.post('/milk/log', data),
  getRecords: (params?: any) => apiClient.get('/milk/records', { params }),
  getStats: () => apiClient.get('/milk/stats'),
  verifyBatch: (batchCode: string) => apiClient.get(`/milk/batch/${batchCode}`),
};

// ─── Marketplace ─────────────────────────────────────────
export const marketplaceAPI = {
  // Public endpoints (no auth required)
  getPublicProducts: (params?: any) => apiClient.get('/marketplace/public/products', { params }),
  
  // Authenticated endpoints (token required)
  listProduct: (data: any) => apiClient.post('/marketplace/products', data),
  getProducts: (params?: any) => apiClient.get('/marketplace/products', { params }),
  getMyProducts: () => apiClient.get('/marketplace/products/my'),
  updateProduct: (productId: string, data: any) => apiClient.put(`/marketplace/products/${productId}`, data),
  placeOrder: (data: any) => apiClient.post('/marketplace/orders', data),
  getMyOrders: () => apiClient.get('/marketplace/orders/my'),
  updateOrderStatus: (orderId: string, status: string) => apiClient.put(`/marketplace/orders/${orderId}/status`, { status }),
  getReputation: () => apiClient.get('/marketplace/reputation'),
};

// ─── Insurance ───────────────────────────────────────────
export const insuranceAPI = {
  // Public endpoints (no auth required)
  getPublicPlans: () => apiClient.get('/insurance/public/plans'),
  
  // Authenticated endpoints (token required)
  checkEligibility: (cowId: string) => apiClient.get(`/insurance/eligibility/${cowId}`),
  purchasePolicy: (data: any) => apiClient.post('/insurance/purchase', data),
  fileClaim: (data: any) => apiClient.post('/insurance/claim', data),
  getMyPolicies: () => apiClient.get('/insurance/policies'),
  getMyClaims: () => apiClient.get('/insurance/claims'),
};

// ─── Transfer ────────────────────────────────────────────
export const transferAPI = {
  // Public endpoints (no auth required)
  getRecentPublic: () => apiClient.get('/transfer/public/recent'),
  verifyCattlePublic: (rfid: string) => apiClient.get(`/transfer/public/verify/${encodeURIComponent(rfid)}`),
  
  // Authenticated endpoints (token required)
  initiate: (data: any) => apiClient.post('/transfer/initiate', data),
  accept: (transferId: string) => apiClient.put(`/transfer/${transferId}/accept`),
  reject: (transferId: string) => apiClient.put(`/transfer/${transferId}/reject`),
  getMy: () => apiClient.get('/transfer/my'),
  getPending: () => apiClient.get('/transfer/pending'),
};

export default apiClient;
