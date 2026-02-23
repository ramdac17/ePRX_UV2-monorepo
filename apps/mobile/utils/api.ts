import axios from "axios";
import { getToken } from "./authStorage";

// Use the environment variable, but fallback to Railway URL if it's missing
const baseURL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://eprxuv1-monorepo-production.up.railway.app/api";

const api = axios.create({
  baseURL: baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "Bypass-Tunnel-Reminder": "true",
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error("TOKEN_RETRIEVAL_ERROR", e);
  }
  return config;
});

export default api;
