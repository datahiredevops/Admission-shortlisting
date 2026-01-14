import axios from 'axios';

// --- THE FIX ---
// We check the Environment Variable FIRST. 
// If it exists (like on Vercel), we use it. 
// If it's missing (like on Localhost), we use your IP.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.166:8000"; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;