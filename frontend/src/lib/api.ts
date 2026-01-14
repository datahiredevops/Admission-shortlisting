import axios from 'axios';

// --- THE NUCLEAR FIX ---
// Replace the URL inside the quotes with your ACTUAL Render Backend URL.
// Do NOT leave a slash (/) at the end.
const API_URL = "https://sairam-backend.onrender.com"; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;