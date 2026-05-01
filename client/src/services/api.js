import axios from 'axios';

// In production: VITE_API_URL = Render backend URL
// In development: Vite proxy handles /api → localhost:5002
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const API = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// ── JWT Token Interceptor ─────────────────────────────────
// Automatically attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('votepath_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (expired token)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('votepath_token');
      localStorage.removeItem('votepath_user');
      // Only redirect if not already on auth page
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth APIs ─────────────────────────────────────────────
export const authRegister = (data) => API.post('/auth/register', data);
export const authLogin = (data) => API.post('/auth/login', data);
export const authGoogle = (idToken) => API.post('/auth/google', { idToken });
export const authCompleteProfile = (data) => API.put('/auth/complete-profile', data);
export const authUpdateProfile = (data) => API.put('/auth/update-profile', data);
export const authGetMe = () => API.get('/auth/me');

// ── User APIs ─────────────────────────────────────────────
export const initUser = (data) => API.post('/user/init', data);
export const getUser = (userId) => API.get(`/user/${userId}`);

// Journey API
export const getJourney = (userId) => API.get(`/journey/${userId}`);

// Timeline API
export const getTimeline = (userId) => API.get(`/timeline/${userId}`);

// Chat API
export const sendChatMessage = (userId, message) => API.post('/chat', { userId, message });
export const getChatHistory = (userId) => API.get(`/chat/${userId}/history`);

// Checklist APIs
export const getChecklist = (userId) => API.get(`/checklist/${userId}`);
export const updateChecklistItem = (userId, itemKey, completed) =>
  API.post('/checklist/update', { userId, itemKey, completed });

// Scenario APIs
export const getScenarios = () => API.get('/scenario/list');
export const runScenario = (userId, scenarioType) => API.post('/scenario', { userId, scenarioType });

// Booth API
export const getBoothGuide = (userId, pincode, area) => API.post('/booth', { userId, pincode, area });

// Quiz APIs
export const getQuiz = () => API.get('/quiz');
export const submitQuiz = (userId, answers) => API.post('/quiz/submit', { userId, answers });

// Health check
export const getHealth = () => API.get('/health');

// Translate API
export const translateText = (text, targetLanguage, targetLanguageCode) =>
  API.post('/translate', { text, targetLanguage, targetLanguageCode });

export default API;
