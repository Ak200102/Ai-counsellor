import axios from "axios";
import store from "../redux/store";
import { clearSession } from "../redux/sessionSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = store.getState().session.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors only for user-initiated actions
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (error.response.data.error === 'Unauthorized') {
        console.log("Authentication error detected, clearing session");
        store.dispatch(clearSession());
        
        // Only redirect if this is not a background validation request
        // Check if the request URL is not /api/user/me (used for validation)
        if (!error.config.url.includes('/api/user/me')) {
          console.log("User action failed, redirecting to landing page");
          window.location.href = "/";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;