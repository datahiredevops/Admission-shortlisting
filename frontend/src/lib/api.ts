import axios from 'axios';

// CHANGE THIS: Use your computer's Network IP instead of localhost
const API_URL = "http://192.168.1.166:8000"; 

// Keep the cloud fallback logic for later if you want
// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.166:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;