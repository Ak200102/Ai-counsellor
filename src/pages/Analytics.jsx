import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import { getMe, getTasks } from "../helpers/endpoints";
import { calculateProfileStrength } from "../helpers/profileUtils";
import {
  ChartBarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  CalendarIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchTasks();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await getMe();
      console.log("Analytics user response:", response);
      
      const userData = response.data || response;
      console.log("Setting Analytics user data:", userData);
      setUser(userData);
    } catch (err) {
      console.error("Failed to load user data:", err);
      setError(err.response?.data?.message || "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  // Calculate analytics based on user data
  const calculateAnalytics = () => {
    if (!user) return null;

    const profile = user.profile || {};
    const shortlistedUniversities = profile.shortlistedUniversities || [];
    const lockedUniversity = profile.lockedUniversity;

    // Task completion analytics using real task data
    const completedTasks = tasks.filter(task => task.status === "COMPLETED").length;
    const inProgressTasks = tasks.filter(task => task.status === "IN_PROGRESS").length;
    const pendingTasks = tasks.filter(task => task.status === "NOT_STARTED").length;
    const totalTasks = tasks.length;
    const totalPoints = tasks.filter(task => task.status === "COMPLETED").reduce((sum, task) => sum + (task.points || 0), 0);
    
    // University analytics
    const totalUniversitiesViewed = shortlistedUniversities.length;
    const hasLockedUniversity = !!lockedUniversity;

    // Profile completion
    const profileStrength = calculateProfileStrength(user, tasks);

    return {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        notStarted: pendingTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      universities: {
        totalViewed: totalUniversitiesViewed,
        shortlisted: shortlistedUniversities.length,
        locked: hasLockedUniversity ? 1 : 0,
        lockedUniversityName: lockedUniversity?.universityId?.name || null
      },
      profile: {
        strength: profileStrength,
        onboardingCompleted: user.onboardingCompleted || false,
        stage: user.stage || "UNKNOWN"
      },
      timeline: generateTimelineData(user)
    };
  };

  const generateTimelineData = (userData) => {
    const timeline = [];
    const now = new Date();
    
    if (userData.createdAt) {
      const createdDate = new Date(userData.createdAt);
      timeline.push({
        date: createdDate,
        title: "Account Created",
        type: "milestone",
        icon: UserGroupIcon
      });
    }
    
    if (userData.onboardingCompleted) {
      timeline.push({
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        title: "Onboarding Completed",
        type: "achievement",
        icon: CheckCircleIcon
      });
    }
    
    const profile = userData.profile || {};
    if (profile.shortlistedUniversities?.length > 0) {
      timeline.push({
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        title: `Shortlisted ${profile.shortlistedUniversities.length} Universities`,
        type: "action",
        icon: AcademicCapIcon
      });
    }
    
    if (profile.lockedUniversity) {
      timeline.push({
        date: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
        title: `Locked ${profile.lockedUniversity.universityId?.name || 'University'}`,
        type: "milestone",
        icon: GlobeAltIcon
      });
    }
    
    return timeline.sort((a, b) => b.date - a.date);
  };

  const analytics = calculateAnalytics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>

      <div className="relative z-10 px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your study abroad journey progress
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.tasks.total}
              </span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Tasks</h3>
            <div className="mt-2">
              <div className="flex items-center text-sm">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">{analytics.tasks.completionRate}% completed</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.universities.shortlisted}
              </span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Universities Shortlisted</h3>
            <div className="mt-2">
              <div className="flex items-center text-sm">
                <EyeIcon className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-blue-500">{analytics.universities.totalViewed} total viewed</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.profile.strength}%
              </span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Profile Strength</h3>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analytics.profile.strength}%` }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center">
                <GlobeAltIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.universities.locked}
              </span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Universities Locked</h3>
            <div className="mt-2">
              {analytics.universities.lockedUniversityName && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {analytics.universities.lockedUniversityName}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Task Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Task Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {analytics.tasks.completed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <ClockIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {analytics.tasks.inProgress}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <DocumentTextIcon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {analytics.tasks.notStarted}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Not Started</div>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Your Journey Timeline</h2>
          <div className="space-y-4">
            {analytics.timeline.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.type === 'milestone' ? 'bg-purple-100 dark:bg-purple-900/50' :
                  item.type === 'achievement' ? 'bg-green-100 dark:bg-green-900/50' :
                  'bg-blue-100 dark:bg-blue-900/50'
                }`}>
                  <item.icon className={`w-5 h-5 ${
                    item.type === 'milestone' ? 'text-purple-600 dark:text-purple-400' :
                    item.type === 'achievement' ? 'text-green-600 dark:text-green-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(item.date)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }
}
