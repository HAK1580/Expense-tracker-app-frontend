import axios from 'axios';

// 1. Environment variable se Base URL pick karein with Fallback
const BASE_URL = import.meta.env.VITE_API_BASE_URL||'http://localhost:3000';


// 2. Axios Instance create karein
const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 10 seconds timeout
});
export default API;