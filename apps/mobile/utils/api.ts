import axios from 'axios';
import { getToken } from './authStorage';

const API_URL = 'http://192.168.0.152:3000/api'; // Use your machine's IP

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;