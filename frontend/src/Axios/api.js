import axios from "axios";

// Vite utilizes 'import.meta.env' to safely access environment variables
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "http://localhost:5000/api",
    withCredentials: true,
})

export default api;
