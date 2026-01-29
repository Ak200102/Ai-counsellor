import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { fetchSession } from "../redux/sessionSlice";

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { token, user, isLoading, error } = useSelector((state) => state.session);

  useEffect(() => {
    console.log("ProtectedRoute: useEffect triggered");
    console.log("ProtectedRoute: token:", !!token);
    console.log("ProtectedRoute: user:", !!user);
    console.log("ProtectedRoute: isLoading:", isLoading);
    console.log("ProtectedRoute: error:", error);
    
    // If no token, redirect to landing
    if (!token) {
      console.log("ProtectedRoute: No token found, redirecting to landing");
      return;
    }

    // If we have token but no user data and not currently loading, fetch session
    if (token && !user && !isLoading) {
      console.log("ProtectedRoute: Token exists but no user data, fetching session");
      dispatch(fetchSession());
    }
  }, [token, user, isLoading, error, dispatch]);

  // Show loading spinner while checking auth
  if (token && !user && isLoading) {
    console.log("ProtectedRoute: Showing loading spinner");
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
  if (!token) {
    console.log("ProtectedRoute: No token, redirecting to landing");
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the protected content
  console.log("ProtectedRoute: Authenticated, rendering children");
  return children;
}
