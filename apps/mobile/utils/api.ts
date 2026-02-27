import axios from "axios";
import { getToken } from "./authStorage";

// Use the environment variable, but fallback to Railway URL if it's missing
const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "https://eprxuv2-monorepo-production.up.railway.app/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
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
