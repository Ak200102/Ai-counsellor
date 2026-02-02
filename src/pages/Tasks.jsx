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
  EyeIcon,
  XMarkIcon,
  InformationCircleIcon,
  ChartBarIcon,
  BookmarkIcon,
  LinkIcon
} from "@heroicons/react/24/outline";
import { getTasks, updateTaskStatus, regenerateTasks } from "../helpers/endpoints.js";

export default withAiCounsellingCheck(Tasks, "Tasks");

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [hoveredTask, setHoveredTask] = useState(null);
  const [celebration, setCelebration] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
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
      console.log("=== FETCHING TASKS ===");
      setLoading(true);
      const response = await getTasks();
      console.log("Tasks response:", response.data);
      setTasks(response.data || []);
      console.log("Tasks set:", response.data || []);
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
      console.log("=== TASK ACTION START ===");
      console.log("Task ID:", taskId);
      console.log("Action:", action);
      
      if (action === 'complete') {
        console.log("Completing task...");
        await updateTaskStatus(taskId, 'COMPLETED');
        setCelebration(true);
        setTimeout(() => setCelebration(false), 2000);
      } else if (action === 'start') {
        console.log("Starting task...");
        await updateTaskStatus(taskId, 'IN_PROGRESS');
      }
      
      console.log("Task action completed, refreshing tasks...");
      // Refresh tasks after update
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setTimeout(() => setSelectedTask(null), 300);
  };

  const handleTaskActionFromModal = async (action) => {
    if (selectedTask) {
      await handleTaskAction(selectedTask._id, action);
      handleCloseModal();
    }
  };

  const handleRegenerateTasks = async () => {
    try {
      setLoading(true);
      await regenerateTasks();
      await fetchTasks(); // Refresh the tasks list
    } catch (error) {
      console.error("Failed to regenerate tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'PROFILE':
        return <UserIcon className="w-6 h-6" />;
      case 'EXAM':
        return <AcademicCapIcon className="w-6 h-6" />;
      case 'DOCUMENTS':
        return <DocumentTextIcon className="w-6 h-6" />;
      case 'APPLICATION':
        return <CalendarIcon className="w-6 h-6" />;
      case 'SOP':
        return <DocumentTextIcon className="w-6 h-6" />;
      default:
        return <CheckCircleIcon className="w-6 h-6" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'PROFILE':
        return "text-blue-400 bg-blue-500/20 border-blue-500";
      case 'EXAM':
        return "text-green-400 bg-green-500/20 border-green-500";
      case 'DOCUMENTS':
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500";
      case 'APPLICATION':
        return "text-purple-400 bg-purple-500/20 border-purple-500";
      case 'SOP':
        return "text-pink-400 bg-pink-500/20 border-pink-500";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500";
    }
  };

  const getTaskSteps = (task) => {
    let steps = [];
    
    if (task.category === 'PROFILE') {
      steps = [
        "Complete your academic information",
        "Add your test scores (IELTS, GRE, etc.)",
        "Set your study goals and preferences",
        "Update your budget and funding plan"
      ];
    } else if (task.category === 'EXAM') {
      steps = [
        "Register for the exam",
        "Prepare study materials",
        "Practice with mock tests",
        "Schedule your test date"
      ];
    } else if (task.category === 'DOCUMENTS') {
      steps = [
        "Gather required documents",
        "Get transcripts from your school",
        "Prepare recommendation letters",
        "Write your personal statement"
      ];
    } else if (task.category === 'APPLICATION') {
      steps = [
        "Research university requirements",
        "Fill out application forms",
        "Submit required documents",
        "Pay application fees"
      ];
    } else if (task.category === 'SOP') {
      steps = [
        "Research program requirements",
        "Outline your story and goals",
        "Write first draft",
        "Get feedback and revise"
      ];
    }
    
    return steps;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    if (filter === "completed") return task.status === "COMPLETED";
    if (filter === "in-progress") return task.status === "IN_PROGRESS";
    if (filter === "pending") return task.status === "NOT_STARTED";
    if (filter === "ai-created") return task.createdBy === "AI";
    return true;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "COMPLETED").length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
    pending: tasks.filter(t => t.status === "NOT_STARTED").length,
    aiCreated: tasks.filter(t => t.createdBy === "AI").length,
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
              <h1 className="text-3xl font-bold text-white">AI-Generated Tasks</h1>
              <p className="text-gray-300">Personalized tasks created by your AI counsellor</p>
            </div>
          </div>
          <button
            onClick={handleRegenerateTasks}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <RocketLaunchIcon className="w-4 h-4" />
            <span>Refresh Tasks</span>
          </button>
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
            {["all", "pending", "in-progress", "completed", "ai-created"].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  filter === filterOption
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {filterOption === "ai-created" && <SparklesIcon className="w-4 h-4" />}
                {filterOption === "ai-created" ? "AI Created" : filterOption.replace("-", " ")}
                {filterOption !== "all" && (
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {filterOption === "pending" ? stats.pending :
                     filterOption === "in-progress" ? stats.inProgress :
                     filterOption === "completed" ? stats.completed :
                     filterOption === "ai-created" ? stats.aiCreated : 0}
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
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-white">
                                {task.title}
                              </h3>
                              {task.createdBy === "AI" && (
                                <span className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 text-xs rounded-full flex items-center gap-1">
                                  <SparklesIcon className="w-3 h-3" />
                                  AI Created
                                </span>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm mb-3">
                              {task.description}
                            </p>
                            {task.reason && (
                              <p className="text-xs text-blue-300 mb-2">
                                <span className="font-medium">Why this matters:</span> {task.reason}
                              </p>
                            )}
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
                          {task.createdBy === "AI" && (
                            <div className="flex items-center text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
                              <SparklesIcon className="w-3 h-3 mr-1" />
                              <span className="text-xs">AI Generated</span>
                            </div>
                          )}
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
                            onClick={() => handleViewDetails(task)}
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

      {/* Task Details Modal */}
      <AnimatePresence>
        {showTaskModal && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getCategoryColor(selectedTask.category)}`}>
                      {getCategoryIcon(selectedTask.category)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{selectedTask.title}</h2>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                          {getStatusIcon(selectedTask.status)}
                          <span className="ml-1">{selectedTask.status.replace('_', ' ')}</span>
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTask.priority)}`}>
                          {selectedTask.priority} priority
                        </span>
                        {selectedTask.createdBy === "AI" && (
                          <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 text-xs rounded-full flex items-center gap-1">
                            <SparklesIcon className="w-3 h-3" />
                            AI Created
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-400" />
                    Task Description
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{selectedTask.description}</p>
                  {selectedTask.reason && (
                    <div className="mt-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-sm text-blue-300">
                        <span className="font-semibold">Why this matters:</span> {selectedTask.reason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Task Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTask.createdBy === "AI" && (
                    <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                      <div className="flex items-center mb-2">
                        <SparklesIcon className="w-5 h-5 mr-2 text-purple-400" />
                        <h4 className="font-semibold text-white">AI Insight</h4>
                      </div>
                      <p className="text-gray-300 text-sm">
                        This task was intelligently generated by your AI counsellor based on your profile analysis
                      </p>
                    </div>
                  )}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center mb-2">
                      <CalendarIcon className="w-5 h-5 mr-2 text-yellow-400" />
                      <h4 className="font-semibold text-white">Due Date</h4>
                    </div>
                    <p className="text-gray-300">
                      {new Date(selectedTask.dueDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {Math.ceil((new Date(selectedTask.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days remaining
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center mb-2">
                      <SparklesIcon className="w-5 h-5 mr-2 text-purple-400" />
                      <h4 className="font-semibold text-white">Points</h4>
                    </div>
                    <p className="text-2xl font-bold text-purple-400">{selectedTask.points || 10}</p>
                    <p className="text-sm text-gray-400">Experience points</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center mb-2">
                      <ChartBarIcon className="w-5 h-5 mr-2 text-green-400" />
                      <h4 className="font-semibold text-white">Category</h4>
                    </div>
                    <p className="text-white capitalize">{selectedTask.category}</p>
                    <p className="text-sm text-gray-400">Task type</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center mb-2">
                      <ClockIcon className="w-5 h-5 mr-2 text-blue-400" />
                      <h4 className="font-semibold text-white">Created</h4>
                    </div>
                    <p className="text-white">
                      {new Date(selectedTask.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-gray-400">by {selectedTask.createdBy}</p>
                  </div>
                </div>

                {/* Progress Section */}
                {selectedTask.status === "IN_PROGRESS" && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <ChartBarIcon className="w-5 h-5 mr-2 text-green-400" />
                      Progress
                    </h3>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedTask.progress || 0}%` }}
                        transition={{ duration: 0.5 }}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full"
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{selectedTask.progress || 0}% complete</p>
                  </div>
                )}

                {/* Task Steps */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <BookmarkIcon className="w-5 h-5 mr-2 text-yellow-400" />
                    Steps to Complete
                  </h3>
                  <div className="space-y-2">
                    {getTaskSteps(selectedTask).map((step, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-blue-400 font-semibold">{index + 1}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Related Links */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <LinkIcon className="w-5 h-5 mr-2 text-purple-400" />
                    Quick Actions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.category === 'PROFILE' && (
                      <button
                        onClick={() => { navigate('/profile'); handleCloseModal(); }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Go to Profile
                      </button>
                    )}
                    {selectedTask.category === 'APPLICATION' && (
                      <button
                        onClick={() => { navigate('/applications'); handleCloseModal(); }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        View Applications
                      </button>
                    )}
                    {selectedTask.category === 'UNIVERSITY' && (
                      <button
                        onClick={() => { navigate('/universities'); handleCloseModal(); }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Browse Universities
                      </button>
                    )}
                    {selectedTask.university && (
                      <button
                        onClick={() => { navigate(`/universities/${selectedTask.university}`); handleCloseModal(); }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        View University
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10 bg-black/20">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Task ID: {selectedTask._id}
                  </div>
                  <div className="flex gap-3">
                    {selectedTask.status === "NOT_STARTED" && (
                      <button
                        onClick={() => handleTaskActionFromModal('start')}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Start Task
                      </button>
                    )}
                    {selectedTask.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => handleTaskActionFromModal('complete')}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
