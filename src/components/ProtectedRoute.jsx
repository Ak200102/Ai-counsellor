import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../helpers/api";

export default function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      
      // If no token, redirect to landing
      if (!token) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        // Verify token by making a request to protected endpoint
        const response = await api.get("/api/user/me");
        if (response.data) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Token is invalid or expired
        console.log("Token validation failed:", error.response?.status);
        localStorage.removeItem("token"); // Clear invalid token
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white text-lg">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to landing page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the protected content
  return children;
}
