import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken } from "../redux/sessionSlice";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get token and user data from URL params
        const token = searchParams.get("token");
        const userStr = searchParams.get("user");
        
        if (token && userStr) {
          const user = JSON.parse(decodeURIComponent(userStr));
          
          // Store token and user data in localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          
          // Set token in Redux
          dispatch(setToken(token));
          
          // Redirect to onboarding (Google users need to complete onboarding)
          navigate("/onboarding");
        } else {
          // If no token or user data, redirect to login
          navigate("/auth/login");
        }
      } catch (error) {
        console.error("Google callback error:", error);
        navigate("/auth/login");
      }
    };

    handleGoogleCallback();
  }, [navigate, dispatch, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-900 dark:text-white text-lg">Completing Google sign up...</p>
      </div>
    </div>
  );
}
