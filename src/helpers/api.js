import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("Authentication error detected, clearing token and redirecting to landing");
      localStorage.removeItem("token");
      
      // Redirect to landing page
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;