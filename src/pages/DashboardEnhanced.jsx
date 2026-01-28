import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getMe, getTasks, getApplications } from "../helpers/endpoints";
import { calculateProfileStrength } from "../helpers/profileUtils";
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
  BellIcon,
  UserIcon
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

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setUser(null);
        setTasks([]);
        setApplications([]);
        setLoading(false);
        return;
      }

      const [userResponse, tasksResponse, applicationsResponse] = await Promise.all([
        getMe(),
        getTasks(),
        getApplications()
      ]);
      
      const userData = userResponse.data || userResponse;
      const tasksData = tasksResponse.data?.data || tasksResponse.data || [];
      
      // Handle applications data - match Application.jsx structure
      let appsData = [];
      if (applicationsResponse.data && applicationsResponse.data.data) {
        appsData = applicationsResponse.data.data;
      } else if (applicationsResponse.data && Array.isArray(applicationsResponse.data)) {
        appsData = applicationsResponse.data;
      }
      
      setUser(userData);
      setTasks(tasksData);
      setApplications(appsData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUser(null);
      setTasks([]);
      setApplications([]);
      setLoading(false);
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

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "COMPLETED").length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
    pending: tasks.filter(t => t.status === "NOT_STARTED").length,
    applications: applications.length,
    shortlisted: user?.profile?.shortlistedUniversities?.length || 0,
    profileStrength: calculateProfileStrength(user, tasks)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      {/* 3D Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            rotateX: mousePosition.y * 0.01,
            rotateY: mousePosition.x * 0.01,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 30 }}
          className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"
          style={{
            transformStyle: 'preserve-3d',
            transform: `perspective(1000px) rotateX(${mousePosition.y * 0.01}deg) rotateY(${mousePosition.x * 0.01}deg)`
          }}
        />
      </div>

      {/* Floating 3D Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              z: Math.random() * 100 - 50
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              z: Math.random() * 100 - 50,
              rotateX: Math.random() * 360,
              rotateY: Math.random() * 360,
              rotateZ: Math.random() * 360
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-1 h-1 bg-white/30 rounded-full blur-sm"
            style={{
              transformStyle: 'preserve-3d'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4">
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
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.applications}</span>
            </div>
            <p className="text-gray-300 text-sm">Applications</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.shortlisted}</span>
            </div>
            <p className="text-gray-300 text-sm">Shortlisted</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.total}</span>
            </div>
            <p className="text-gray-300 text-sm">Total Tasks</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <TrophyIcon className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.profileStrength}%</span>
            </div>
            <p className="text-gray-300 text-sm">Profile Strength</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/universities")}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <GlobeAltIcon className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Browse Universities</h3>
            <p className="text-gray-400 text-sm">Find your dream school</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/application")}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all group"
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <DocumentTextIcon className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">My Applications</h3>
            <p className="text-gray-400 text-sm">Track your progress</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/tasks")}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all group"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ClockIcon className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Tasks</h3>
            <p className="text-gray-400 text-sm">Stay organized</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all group"
          >
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ChartBarIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Analytics</h3>
            <p className="text-gray-400 text-sm">View insights</p>
          </motion.button>
        </div>

        {/* User Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
              {(user?.avatar && user?.avatar !== '/logo.png' && user?.avatar !== 'logo.png') || (user?.profile?.avatar && user?.profile?.avatar !== '/logo.png' && user?.profile?.avatar !== 'logo.png') ? (
                <img 
                  src={user?.avatar || user?.profile?.avatar} 
                  alt="Profile Avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Avatar failed to load in user info card:', e);
                    // Fallback to icon if image fails
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14"></path></svg>';
                  }}
                />
              ) : (
                <UserIcon className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.name || 'Student'}</h2>
              <p className="text-gray-300">{user?.email || 'student@example.com'}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="px-3 py-1 bg-green-500/20 border border-green-500 text-green-400 text-xs rounded-full">
                  Active
                </span>
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500 text-blue-400 text-xs rounded-full">
                  {user?.role || 'Student'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Tasks</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/tasks")}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm text-white"
            >
              View All
            </motion.button>
          </div>
          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.slice(0, 5).map((task, index) => (
                <motion.div
                  key={task._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => navigate("/tasks")}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(task.status)}`}>
                      {getStatusIcon(task.status)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{task.title}</p>
                      <p className="text-gray-400 text-sm">{task.description}</p>
                      {task.deadline && (
                        <p className="text-gray-500 text-xs mt-1">
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No tasks yet. Create your first task!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/tasks")}
                  className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Create Task
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
