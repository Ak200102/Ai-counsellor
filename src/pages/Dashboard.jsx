import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getMe, getTasks, getApplications } from "../helpers/endpoints";
import {
  AcademicCapIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  DocumentTextIcon,
  SparklesIcon,
  RocketLaunchIcon,
  PlayIcon,
  LockClosedIcon,
  BookOpenIcon,
  PencilIcon,
  GlobeAltIcon,
  FireIcon,
  TrophyIcon,
  StarIcon,
  ArrowRightIcon,
  HandThumbUpIcon,
  EyeIcon,
  BellIcon
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [celebration, setCelebration] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  // Auto-refresh when page gains focus (user navigates back from Application page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log("=== PAGE GAINED FOCUS - REFRESHING DASHBOARD ===");
        fetchUserData();
      }
    };

    const handleFocus = () => {
      if (user) {
        console.log("=== WINDOW FOCUSED - REFRESHING DASHBOARD ===");
        fetchUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  // Poll for new applications every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      console.log("=== POLLING FOR NEW APPLICATIONS ===");
      forceRefreshApplications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      console.log("=== DASHBOARD FETCH START ===");
      console.log("Token exists:", !!localStorage.getItem("token"));
      
      // Fetch user data, tasks, and applications in parallel
      const [userResponse, tasksResponse, applicationsResponse] = await Promise.all([
        getMe(),
        getTasks(),
        getApplications()
      ]);

      console.log("=== RAW RESPONSES ===");
      console.log("User Response:", userResponse);
      console.log("Tasks Response:", tasksResponse);
      console.log("Applications Response:", applicationsResponse);
      
      console.log("=== APPLICATIONS DATA ANALYSIS ===");
      console.log("Applications Response status:", applicationsResponse.status);
      console.log("Applications Response data:", applicationsResponse.data);
      console.log("Applications Response data.data:", applicationsResponse.data.data);
      console.log("Applications Response data.data type:", typeof applicationsResponse.data.data);
      console.log("Applications Response data.data isArray:", Array.isArray(applicationsResponse.data.data));
      console.log("Applications Length:", applicationsResponse.data.data?.length || 0);

      setUser(userResponse.data);
      setTasks(tasksResponse.data.data || []);
      
      // Handle applications data - match Application.jsx structure
      let appsData = [];
      if (applicationsResponse.data && applicationsResponse.data.data) {
        appsData = applicationsResponse.data.data;
      } else if (applicationsResponse.data && Array.isArray(applicationsResponse.data)) {
        appsData = applicationsResponse.data;
      }
      
      setApplications(appsData);
      
      console.log("=== FINAL STATE ===");
      console.log("Applications set to:", appsData);
      console.log("Applications length in state:", appsData.length);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  };

  // Manual refresh function
  const forceRefreshApplications = async () => {
    try {
      console.log("=== FORCE REFRESH APPLICATIONS ===");
      const response = await getApplications();
      console.log("Force refresh response:", response);
      
      // Handle applications data - match Application.jsx structure
      let appsData = [];
      if (response.data && response.data.data) {
        appsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        appsData = response.data;
      }
      
      setApplications(appsData);
      console.log("Force refreshed applications:", appsData.length);
    } catch (error) {
      console.error("Force refresh failed:", error);
    }
  };

  // Direct API test function
  const testApplicationsAPI = async () => {
    try {
      console.log("=== DIRECT API TEST ===");
      
      // Check token
      const token = localStorage.getItem("token");
      console.log("Token exists:", !!token);
      console.log("Token value:", token ? token.substring(0, 20) + "..." : "none");
      
      // Make direct API call
      const response = await fetch("http://localhost:8000/api/applications", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      console.log("Direct API response status:", response.status);
      console.log("Direct API response headers:", response.headers);
      
      const data = await response.json();
      console.log("Direct API response data:", data);
      console.log("Direct API applications count:", data.data?.length || 0);
      
      if (data.data && data.data.length > 0) {
        console.log("🎉 APPLICATIONS FOUND:");
        data.data.forEach((app, index) => {
          console.log(`  ${index + 1}. ${app.program} at ${app.university?.name || 'Unknown'} (${app.status})`);
        });
      } else {
        console.log("❌ No applications found in direct API call");
      }
      
    } catch (error) {
      console.error("❌ Direct API test failed:", error);
    }
  };

  const calculate3DTransform = (element) => {
    if (!element) return {};
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateX = ((mousePosition.y - centerY) / 10) * -1;
    const rotateY = (mousePosition.x - centerX) / 10;
    return { rotateX, rotateY };
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    if (filter === "completed") return task.status === "COMPLETED";
    if (filter === "in-progress") return task.status === "IN_PROGRESS";
    if (filter === "pending") return task.status === "NOT_STARTED";
    return true;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "COMPLETED").length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
    pending: tasks.filter(t => t.status === "NOT_STARTED").length
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case "IN_PROGRESS":
        return <ClockIcon className="w-5 h-5 text-blue-400" />;
      case "NOT_STARTED":
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/20 border-green-500 text-green-400";
      case "IN_PROGRESS":
        return "bg-blue-500/20 border-blue-500 text-blue-400";
      case "NOT_STARTED":
        return "bg-yellow-500/20 border-yellow-500 text-yellow-400";
      default:
        return "bg-gray-500/20 border-gray-500 text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-300 mb-6">Please log in to view your dashboard</p>
          <button
            onClick={() => navigate("/auth/login")}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* MOBILE DEBUG TEST */}
      <div style={{ 
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        backgroundColor: 'red',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        zIndex: '999999'
      }}>
        🚨 MOBILE DEBUG TEST 🚨
        <button 
          onClick={() => navigate('/ai-counsellor')}
          style={{
            backgroundColor: '#4F46E5',
            color: 'white',
            padding: '15px 25px',
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '10px',
            cursor: 'pointer',
            borderRadius: '8px',
            border: '2px solid #4F46E5',
            touchAction: 'manipulation',
            minHeight: '60px'
          }}
        >
          Go to AI Counsellor
        </button>
        <div>📱 TAP ME - MOBILE TEST 📱</div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Logo */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Logo failed to load:', e);
                  // Fallback to icon if image fails
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>';
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-300">Welcome back, {user?.name || 'Student'}!</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Applications</p>
                  <p className="text-2xl font-bold text-white">{applications.length}</p>
                </div>
                <DocumentTextIcon className="w-8 h-8 text-blue-400" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Tasks</p>
                  <p className="text-2xl font-bold text-white">{tasks.length}</p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-green-400" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">
                    {tasks.filter(t => t.status === 'COMPLETED').length}
                  </p>
                </div>
                <TrophyIcon className="w-8 h-8 text-yellow-400" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">In Progress</p>
                  <p className="text-2xl font-bold text-white">
                    {tasks.filter(t => t.status === 'IN_PROGRESS').length}
                  </p>
                </div>
                <ClockIcon className="w-8 h-8 text-orange-400" />
              </div>
            </motion.div>
          </div>

          {/* Applications Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-white">Your Applications</h2>
                <div className="bg-yellow-500/20 border border-yellow-500 px-2 py-1 rounded">
                  <span className="text-yellow-400 text-xs font-mono">
                    Count: {applications.length}
                  </span>
                </div>
                <div className="bg-green-500/20 border border-green-500 px-2 py-1 rounded">
                  <span className="text-green-400 text-xs font-mono">
                    Live: {applications.length > 0 ? '✓' : '✗'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={testApplicationsAPI}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                >
                  Test API
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={forceRefreshApplications}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                >
                  Refresh
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/applications')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                >
                  View All
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {applications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 text-center"
              >
                <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Applications Yet</h3>
                <p className="text-gray-400 mb-6">
                  Start your journey by creating your first university application.
                </p>
                <button
                  onClick={() => navigate('/applications')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Create Application
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.slice(0, 3).map((application) => (
                  <motion.div
                    key={application._id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        {application.university?.name || 'Application'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        application.status === 'SUBMITTED' 
                          ? 'text-green-400 bg-green-500/20 border-green-500/30'
                          : application.status === 'IN_PROGRESS'
                          ? 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
                          : 'text-gray-400 bg-gray-500/20 border-gray-500/30'
                      }`}>
                        {application.status?.replace('_', ' ') || 'Draft'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-gray-300 text-sm">
                        <span className="font-medium">Program:</span> {application.program || 'Not specified'}
                      </p>
                      {application.gpa && (
                        <p className="text-gray-300 text-sm">
                          <span className="font-medium">GPA:</span> {application.gpa}
                        </p>
                      )}
                      {application.deadline && (
                        <p className="text-gray-300 text-sm">
                          <span className="font-medium">Deadline:</span> {new Date(application.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {application.documents && application.documents.length > 0 && (
                      <div className="mb-4">
                        <p className="text-gray-300 text-sm mb-2">
                          Documents: {application.documents.length} uploaded
                        </p>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-blue-500" 
                            style={{ width: `${(application.documents.length / 5) * 100}%` }} 
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate('/applications')}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigate('/applications')}
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Upload Document
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/universities')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-left"
            >
              <GlobeAltIcon className="w-8 h-8 text-white mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Explore Universities</h3>
              <p className="text-blue-100 text-sm">Find your dream university</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/ai-counsellor')}
              className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-left"
            >
              <SparklesIcon className="w-8 h-8 text-white mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">AI Counsellor</h3>
              <p className="text-green-100 text-sm">Get personalized guidance</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/tasks')}
              className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-left"
            >
              <RocketLaunchIcon className="w-8 h-8 text-white mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Tasks</h3>
              <p className="text-orange-100 text-sm">Track your progress</p>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
