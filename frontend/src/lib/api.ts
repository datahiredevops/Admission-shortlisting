import axios from 'axios';

// --- THE FIX ---
// We are removing the local IP entirely. 
// This forces the app to use the Render Cloud URL.
const API_URL = "https://sairam-backend-0q3y.onrender.com"; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;