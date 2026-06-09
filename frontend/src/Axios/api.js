import axios from "axios";

const API_BASE =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_API_URL_DEV
    : import.meta.env.VITE_API_URL_PROD;

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

export default api;