import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../helpers/api";

export default function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      console.log("ProtectedRoute: Checking auth, token exists:", !!token);
      
      // If no token, redirect to landing
      if (!token) {
        console.log("ProtectedRoute: No token found, redirecting to landing");
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      // If token exists, assume authenticated for now
      // The API interceptor will handle token validation
      console.log("ProtectedRoute: Token found, allowing access");
      setIsAuthenticated(true);
      setIsLoading(false);

      // Optionally validate token in background
      try {
        console.log("ProtectedRoute: Validating token in background");
        await api.get("/api/user/me");
        console.log("ProtectedRoute: Token validation successful");
      } catch (error) {
        console.log("ProtectedRoute: Token validation failed in background:", error.response?.status);
        // Token is invalid, but we'll let the API interceptor handle the redirect
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
