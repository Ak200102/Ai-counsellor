import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getMe, getTasks } from "../helpers/endpoints";
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
        setLoading(false);
        return;
      }

      const [userResponse, tasksResponse] = await Promise.all([
        getMe(),
        getTasks()
      ]);
      
      const userData = userResponse.data || userResponse;
      const tasksData = tasksResponse.data?.data || tasksResponse.data || [];
      
      setUser(userData);
      setTasks(tasksData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUser(null);
      setTasks([]);
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
          onClick={() => alert('Mobile test button works!')}
          style={{
            backgroundColor: 'yellow',
            color: 'black',
            padding: '15px 25px',
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '10px',
            cursor: 'pointer',
            borderRadius: '8px',
            border: '2px solid black',
            touchAction: 'manipulation',
            minHeight: '60px'
          }}
        >
          📱 TAP ME - MOBILE TEST 📱
        </button>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
        {/* Original Dashboard Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-4">Dashboard</h1>
          <p className="text-gray-300">Welcome to your dashboard</p>
        </div>
      </div>
    </div>
  );
}
