import axios from 'axios';

// --- HARDCODED FOR DEMO ---
const API_URL = "https://sairam-backend.onrender.com"; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;