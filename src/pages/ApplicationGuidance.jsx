import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getMe } from "../helpers/endpoints";
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  LockClosedIcon,
  BookOpenIcon,
  PencilIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

export default function ApplicationGuidance() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await getMe();
      console.log("Application Guidance user response:", response);
      
      // Handle different response structures
      const userData = response.data || response;
      console.log("Setting user data:", userData);
      setUser(userData);
      
      // Check if user has locked a university
      if (!userData.lockedUniversity) {
        setError("You must lock a university before accessing application guidance.");
      }
    } catch (err) {
      console.error("Failed to load user data:", err);
      setError(err.response?.data?.message || "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading application guidance...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.lockedUniversity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <LockClosedIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            University Lock Required
          </h3>
          <p className="text-gray-300 mb-6">
            You must lock at least one university before accessing application guidance.
          </p>
          <button
            onClick={() => navigate("/universities")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            Select University
          </button>
        </div>
      </div>
    );
  }

  const lockedUniversity = user.lockedUniversity;

  // Generate real-time application timeline based on user tasks
  const generateApplicationTimeline = () => {
    const profile = user?.profile || {};
    const tasks = profile.tasks || [];
    const timeline = [];
    
    // Document Preparation Phase
    const documentTasks = tasks.filter(task => 
      task.category === "DOCUMENT" || 
      task.title?.toLowerCase().includes("transcript") ||
      task.title?.toLowerCase().includes("recommendation") ||
      task.title?.toLowerCase().includes("sop") ||
      task.title?.toLowerCase().includes("resume")
    );
    
    if (documentTasks.length > 0) {
      const completedDocs = documentTasks.filter(task => task.status === "COMPLETED").length;
      timeline.push({
        phase: "Document Preparation",
        duration: "2-3 weeks",
        status: completedDocs === documentTasks.length ? "completed" : "in-progress",
        tasks: documentTasks.map(task => task.title),
        progress: Math.round((completedDocs / documentTasks.length) * 100)
      });
    } else {
      timeline.push({
        phase: "Document Preparation",
        duration: "2-3 weeks",
        status: "upcoming",
        tasks: [
          "Prepare academic transcripts",
          "Get recommendation letters", 
          "Write Statement of Purpose",
          "Update resume/CV"
        ],
        progress: 0
      });
    }
    
    // Application Submission Phase
    const applicationTasks = tasks.filter(task => 
      task.category === "APPLICATION" ||
      task.title?.toLowerCase().includes("application") ||
      task.title?.toLowerCase().includes("submit")
    );
    
    if (applicationTasks.length > 0) {
      const completedApps = applicationTasks.filter(task => task.status === "COMPLETED").length;
      timeline.push({
        phase: "Application Submission",
        duration: "1 week",
        status: completedApps === applicationTasks.length ? "completed" : "in-progress",
        tasks: applicationTasks.map(task => task.title),
        progress: Math.round((completedApps / applicationTasks.length) * 100)
      });
    } else {
      timeline.push({
        phase: "Application Submission",
        duration: "1 week",
        status: "upcoming",
        tasks: [
          "Complete online application",
          "Pay application fees",
          "Submit required documents",
          "Track application status"
        ],
        progress: 0
      });
    }
    
    // Interview Preparation Phase
    const interviewTasks = tasks.filter(task => 
      task.category === "INTERVIEW" ||
      task.title?.toLowerCase().includes("interview") ||
      task.title?.toLowerCase().includes("mock")
    );
    
    if (interviewTasks.length > 0) {
      const completedInterviews = interviewTasks.filter(task => task.status === "COMPLETED").length;
      timeline.push({
        phase: "Interview Preparation",
        duration: "2-3 weeks",
        status: completedInterviews === interviewTasks.length ? "completed" : "in-progress",
        tasks: interviewTasks.map(task => task.title),
        progress: Math.round((completedInterviews / interviewTasks.length) * 100)
      });
    } else {
      timeline.push({
        phase: "Interview Preparation",
        duration: "2-3 weeks",
        status: "upcoming",
        tasks: [
          "Research common interview questions",
          "Practice with mock interviews",
          "Prepare portfolio/projects",
          "Schedule interview slots"
        ],
        progress: 0
      });
    }
    
    return timeline;
  };

  const applicationTimeline = generateApplicationTimeline();

  // Generate real-time required documents based on user profile
  const generateRequiredDocuments = () => {
    const profile = user?.profile || {};
    const documents = [];
    
    // Academic Transcripts
    documents.push({
      name: "Academic Transcripts",
      status: profile.exams?.transcripts ? "completed" : "pending",
      description: "Official transcripts from all previous institutions",
      dueDate: "Required for application"
    });
    
    // Statement of Purpose
    const sopTask = profile.tasks?.find(task => 
      task.title?.toLowerCase().includes("sop") || 
      task.title?.toLowerCase().includes("statement")
    );
    documents.push({
      name: "Statement of Purpose",
      status: sopTask ? sopTask.status.toLowerCase() : "pending",
      description: "Personal statement explaining your goals and motivations",
      dueDate: "Required for application"
    });
    
    // Recommendation Letters
    const recTask = profile.tasks?.find(task => 
      task.title?.toLowerCase().includes("recommendation") ||
      task.title?.toLowerCase().includes("reference")
    );
    documents.push({
      name: "Recommendation Letters",
      status: recTask ? recTask.status.toLowerCase() : "pending",
      description: "2-3 letters from professors or employers",
      dueDate: "Required for application"
    });
    
    // Resume/CV
    const resumeTask = profile.tasks?.find(task => 
      task.title?.toLowerCase().includes("resume") ||
      task.title?.toLowerCase().includes("cv")
    );
    documents.push({
      name: "Resume/CV",
      status: resumeTask ? resumeTask.status.toLowerCase() : "pending",
      description: "Updated resume highlighting relevant experience",
      dueDate: "Required for application"
    });
    
    // English Proficiency Test
    documents.push({
      name: "English Proficiency Test",
      status: profile.exams?.ielts || profile.exams?.toefl ? "completed" : "pending",
      description: "IELTS/TOEFL scores meeting university requirements",
      dueDate: "Required for application"
    });
    
    // Portfolio
    const portfolioTask = profile.tasks?.find(task => 
      task.title?.toLowerCase().includes("portfolio") ||
      task.title?.toLowerCase().includes("project")
    );
    documents.push({
      name: "Portfolio",
      status: portfolioTask ? portfolioTask.status.toLowerCase() : "pending",
      description: "Portfolio of relevant projects and work",
      dueDate: "Required for application"
    });
    
    return documents;
  };

  const requiredDocuments = generateRequiredDocuments();

  // Get real user tasks
  const aiGeneratedTasks = user?.profile?.tasks?.slice(0, 5).map(task => ({
    id: task._id,
    title: task.title,
    description: task.description || "Task for application preparation",
    priority: task.priority || "medium",
    status: task.status.toLowerCase(),
    dueDate: task.dueDate || "TBD",
    category: task.category || "GENERAL"
  })) || [];

  const getDocumentStatusColor = (status) => {
    switch (status) {
      case "completed": return "text-green-400";
      case "in-progress": return "text-yellow-400";
      case "pending": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const getDocumentStatusIcon = (status) => {
    switch (status) {
      case "completed": return CheckCircleIcon;
      case "in-progress": return ClockIcon;
      case "pending": return ExclamationTriangleIcon;
      default: return DocumentTextIcon;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 px-4 sm:px-6 lg:px-8 py-8">
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

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-2xl p-8"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="mb-6 lg:mb-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-3 mb-4"
              >
                <LockClosedIcon className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Application Guidance</h1>
              </motion.div>
              <p className="text-green-100 text-lg mb-2">
                You've locked in: <span className="font-bold">{lockedUniversity.name}</span>
              </p>
              <p className="text-green-200 text-sm">
                Let's prepare your application for success
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <DocumentTextIcon className="w-16 h-16 text-white" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Application Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-xl font-bold text-white mb-6">Application Timeline</h2>
          <div className="space-y-4">
            {applicationTimeline.map((phase, index) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  phase.status === "in-progress" ? "bg-yellow-500/20 border-yellow-500" :
                  phase.status === "completed" ? "bg-green-500/20 border-green-500" :
                  "bg-gray-500/20 border-gray-500"
                }`}>
                  <CalendarIcon className={`w-6 h-6 ${
                    phase.status === "in-progress" ? "text-yellow-400" :
                    phase.status === "completed" ? "text-green-400" :
                    "text-gray-400"
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{phase.phase}</h3>
                    <span className="text-sm text-gray-400">{phase.duration}</span>
                  </div>
                  <div className="space-y-1">
                    {phase.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <p className="text-sm text-gray-300">{task}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Required Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-xl font-bold text-white mb-6">Required Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredDocuments.map((doc, index) => (
              <motion.div
                key={doc.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <doc.icon className={`w-5 h-5 ${getDocumentStatusColor(doc.status)}`} />
                    <h3 className="font-semibold text-white">{doc.name}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    doc.status === "completed" ? "bg-green-500/20 border-green-500 text-green-400" :
                    doc.status === "in-progress" ? "bg-yellow-500/20 border-yellow-500 text-yellow-400" :
                    "bg-red-500/20 border-red-500 text-red-400"
                  }`}>
                    {doc.status}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{doc.description}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <ClockIcon className="w-3 h-3" />
                  <span>Due: {new Date(doc.dueDate).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI-Generated Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-xl font-bold text-white mb-6">AI-Generated Tasks</h2>
          <div className="space-y-4">
            {aiGeneratedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-white">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === "high" ? "bg-red-500/20 border-red-500 text-red-400" :
                        task.priority === "medium" ? "bg-yellow-500/20 border-yellow-500 text-yellow-400" :
                        "bg-gray-500/20 border-gray-500 text-gray-400"
                      }`}>
                        {task.priority}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 border-blue-500 text-blue-400">
                        {task.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{task.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-3 h-3" />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-3 h-3" />
                        <span className={`${
                          task.status === "completed" ? "text-green-400" :
                          task.status === "in-progress" ? "text-yellow-400" :
                          "text-red-400"
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      task.status === "completed" 
                        ? "bg-green-600 text-white cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                    disabled={task.status === "completed"}
                  >
                    {task.status === "completed" ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      <ArrowRightIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all cursor-pointer"
            onClick={() => navigate("/counsellor")}
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <UserGroupIcon className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Get AI Help</h3>
            <p className="text-sm text-gray-300">Ask your AI counsellor for application advice</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all cursor-pointer"
            onClick={() => navigate("/tasks")}
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Manage Tasks</h3>
            <p className="text-sm text-gray-300">Track and complete your application tasks</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
              <PencilIcon className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Update Profile</h3>
            <p className="text-sm text-gray-300">Keep your information up to date</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
