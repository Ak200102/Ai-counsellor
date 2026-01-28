import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import withAiCounsellingCheck from "../components/withAiCounsellingCheck";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  UserIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowRightIcon,
  SparklesIcon,
  FireIcon,
  TrophyIcon,
  StarIcon,
  HandThumbUpIcon,
  RocketLaunchIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { getTasks, updateTaskStatus } from "../helpers/endpoints.js";

export default withAiCounsellingCheck(Tasks, "Tasks");

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [hoveredTask, setHoveredTask] = useState(null);
  const [celebration, setCelebration] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getTasks();
      setTasks(response.data || []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      // Set empty array on error
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAction = async (taskId, action) => {
    try {
      if (action === 'complete') {
        await updateTaskStatus(taskId, { status: 'COMPLETED' });
        setCelebration(true);
        setTimeout(() => setCelebration(false), 2000);
      } else if (action === 'start') {
        await updateTaskStatus(taskId, { status: 'IN_PROGRESS' });
      }
      
      // Refresh tasks after update
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
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
    pending: tasks.filter(t => t.status === "NOT_STARTED").length,
    totalPoints: tasks.filter(t => t.status === "COMPLETED").reduce((sum, task) => sum + (task.points || 0), 0)
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 border-red-500 text-red-400";
      case "medium":
        return "bg-yellow-500/20 border-yellow-500 text-yellow-400";
      case "low":
        return "bg-gray-500/20 border-gray-500 text-gray-400";
      default:
        return "bg-gray-500/20 border-gray-500 text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 overflow-hidden">
      {/* 3D Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            rotateX: mousePosition.y * 0.01,
            rotateY: mousePosition.x * 0.01,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 30 }}
          className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-blue-600/10"
          style={{
            transformStyle: 'preserve-3d',
            transform: `perspective(1000px) rotateX(${mousePosition.y * 0.01}deg) rotateY(${mousePosition.x * 0.01}deg)`
          }}
        />
      </div>

      {/* Floating 3D Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
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

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8" style={{ perspective: '1000px' }}>
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 overflow-hidden"
          >
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          </motion.div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Tasks</h1>
              <p className="text-gray-300">Track your academic journey progress</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-gray-300">Total Tasks</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
              <div className="text-sm text-gray-300">Completed</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{stats.inProgress}</div>
              <div className="text-sm text-gray-300">In Progress</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
              <div className="text-sm text-gray-300">Pending</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{stats.totalPoints}</div>
              <div className="text-sm text-gray-300">Points Earned</div>
            </div>
          </motion.div>
        </div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Overall Progress</h3>
            <span className="text-2xl font-bold text-blue-400">
              {Math.round((stats.completed / stats.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.completed / stats.total) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full"
            />
          </div>
          <p className="text-sm text-gray-300 mt-2">
            {stats.completed} of {stats.total} tasks completed
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "in-progress", "completed"].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === filterOption
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {filterOption.replace("-", " ")}
                {filterOption !== "all" && (
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {filterOption === "pending" ? stats.pending :
                     filterOption === "in-progress" ? stats.inProgress :
                     stats.completed}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tasks List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredTasks.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-400">
                  {filter === "completed" ? "No completed tasks yet" : "No tasks in this category"}
                </p>
              </motion.div>
            ) : (
              filteredTasks.map((task, index) => (
                <motion.div
                  key={task._id || index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all cursor-pointer">
                    <div className="flex items-start space-x-4">
                      {/* Task Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getStatusColor(task.status)}`}>
                        {task.category === 'PROFILE' && <UserIcon className="w-6 h-6" />}
                        {task.category === 'EXAM' && <AcademicCapIcon className="w-6 h-6" />}
                        {task.category === 'DOCUMENTS' && <DocumentTextIcon className="w-6 h-6" />}
                        {task.category === 'APPLICATION' && <CalendarIcon className="w-6 h-6" />}
                        {!task.category && <CheckCircleIcon className="w-6 h-6" />}
                      </div>

                        {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {task.title}
                            </h3>
                            <p className="text-gray-300 text-sm mb-3">
                              {task.description}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar for in-progress tasks */}
                        {task.status === "IN_PROGRESS" && task.progress !== undefined && (
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-400">Progress</span>
                              <span className="text-sm font-medium text-white">
                                {task.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${task.progress}%` }}
                                transition={{ duration: 0.5 }}
                                className="bg-blue-500 h-2 rounded-full"
                              />
                            </div>
                          </div>
                        )}

                        {/* Task Meta */}
                        <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
                          <div className="flex items-center text-gray-400">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority} priority
                          </span>
                          <div className="flex items-center text-purple-400">
                            <SparklesIcon className="w-4 h-4 mr-1" />
                            {task.points} points
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {task.status === "NOT_STARTED" && (
                            <button
                              onClick={() => handleTaskAction(task._id, 'start')}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              Start Task
                            </button>
                          )}
                          {task.status === "IN_PROGRESS" && (
                            <button
                              onClick={() => handleTaskAction(task._id, 'complete')}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              Mark Complete
                            </button>
                          )}
                          {task.status === "COMPLETED" && (
                            <button
                              disabled
                              className="px-4 py-2 bg-gray-600 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed"
                            >
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Completed
                            </button>
                          )}
                          <button
                            onClick={() => navigate("/universities")}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            View Details
                            <ArrowRightIcon className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  </div>
  );
}
