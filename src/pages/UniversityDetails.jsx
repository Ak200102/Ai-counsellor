import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getUniversityById, shortlistUniversity, unshortlistUniversity, lockUniversity, getMe } from "../helpers/endpoints.js";
import {
  ArrowLeftIcon,
  MapPinIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  LockClosedIcon,
  HeartIcon,
  ShareIcon,
  BookmarkIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  SparklesIcon,
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  LanguageIcon,
  BanknotesIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function UniversityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  useEffect(() => {
    fetchUniversity();
    fetchUserData();
  }, []);

  const fetchUniversity = async () => {
    try {
      const response = await getUniversityById(id);
      const universityData = response.data;
      setUniversity(universityData);
      setIsShortlisted(universityData.isShortlisted || false);
      setIsLocked(universityData.isLocked || false);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch university:", error);
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const userResponse = await getMe();
      setUser(userResponse.data || userResponse);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const handleShortlist = async () => {
    try {
      if (isShortlisted) {
        // Remove from shortlist
        await unshortlistUniversity(id);
        setIsShortlisted(false);
        console.log(`Removed ${university.name} from shortlist`);
      } else {
        // Add to shortlist
        await shortlistUniversity(id);
        setIsShortlisted(true);
        console.log(`Added ${university.name} to shortlist`);
      }
    } catch (error) {
      console.error("Failed to shortlist university:", error);
      setMessage("Failed to shortlist university. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLock = async () => {
    try {
      await lockUniversity(id);
      setIsLocked(!isLocked);
      console.log(`${isLocked ? 'Unlocked' : 'Locked'} university`);
    } catch (error) {
      console.error("Failed to lock university:", error);
      setMessage("Failed to lock university. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleApplyNow = async () => {
    try {
      // Check if user is logged in
      if (!user) {
        setMessage("Please login to apply to universities");
        setMessageType("error");
        setTimeout(() => {
          setMessage("");
          navigate("/auth/login");
        }, 2000);
        return;
      }
      
      // Check if university is locked (requirement for application)
      if (!isLocked) {
        setMessage("Please lock this university first before applying");
        setMessageType("error");
        setTimeout(() => setMessage(""), 3000);
        return;
      }
      
      // Navigate to application page or show application form
      navigate(`/application?university=${id}`);
      console.log(`Applying to ${university.name}`);
    } catch (error) {
      console.error("Failed to apply:", error);
      setMessage("Failed to process application. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleSaveForLater = async () => {
    try {
      // Check if user is logged in
      if (!user) {
        setMessage("Please login to save universities");
        setMessageType("error");
        setTimeout(() => {
          setMessage("");
          navigate("/auth/login");
        }, 2000);
        return;
      }
      
      // Toggle shortlist status
      await handleShortlist();
      console.log(`${isShortlisted ? 'Removed from' : 'Added to'} saved universities`);
    } catch (error) {
      console.error("Failed to save university:", error);
      setMessage("Failed to save university. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleShareUniversity = () => {
    try {
      // Get current URL
      const url = window.location.href;
      
      // Check if Web Share API is available
      if (navigator.share) {
        navigator.share({
          title: university.name,
          text: `Check out ${university.name} - ${university.location || university.country}`,
          url: url
        }).then(() => {
          console.log("University shared successfully");
        }).catch((error) => {
          console.log("Share cancelled or failed:", error);
          // Fallback to copying to clipboard
          copyToClipboard(url);
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        copyToClipboard(url);
      }
    } catch (error) {
      console.error("Failed to share university:", error);
      setMessage("Failed to share university. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const copyToClipboard = (text) => {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      console.log("University link copied to clipboard");
      setMessage("University link copied to clipboard!");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      setMessage("Failed to copy university link. Please copy manually.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading university details...</p>
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">University not found</h2>
          <p className="text-gray-300 mb-6">The university you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/universities")}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
          >
            Back to Universities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      {/* Message Display */}
      {message && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`p-4 rounded-lg border ${
            messageType === 'success' 
              ? 'bg-green-500/20 border-green-500 text-green-300' 
              : 'bg-red-500/20 border-red-500 text-red-300'
          }`}>
            <p className="text-sm font-medium">{message}</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="relative">
        {/* Hero Section with Background Image */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={university.image || "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"}
            alt={university.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          
          {/* Back Button */}
          <div className="absolute top-8 left-8 z-10">
            <button
              onClick={() => navigate("/universities")}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Universities
            </button>
          </div>

          {/* University Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      university.category === 'DREAM' ? 'bg-orange-500/80 backdrop-blur-sm' :
                      university.category === 'TARGET' ? 'bg-yellow-500/80 backdrop-blur-sm' :
                      university.category === 'SAFE' ? 'bg-green-500/80 backdrop-blur-sm' :
                      'bg-gray-500/80 backdrop-blur-sm'
                    }`}>
                      {university.category || 'GENERAL'}
                    </div>
                    {isShortlisted && (
                      <div className="px-4 py-2 bg-yellow-500/80 backdrop-blur-sm rounded-full flex items-center gap-2">
                        <StarIcon className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-medium">Shortlisted</span>
                      </div>
                    )}
                    {isLocked && (
                      <div className="px-4 py-2 bg-red-500/80 backdrop-blur-sm rounded-full flex items-center gap-2">
                        <LockClosedIcon className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-medium">Locked</span>
                      </div>
                    )}
                  </div>
                  <h1 className="text-5xl font-bold text-white mb-4">{university.name}</h1>
                  <div className="flex items-center gap-6 text-white/90">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-5 h-5" />
                      <span>{university.location || university.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GlobeAltIcon className="w-5 h-5" />
                      <span>{university.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrophyIcon className="w-5 h-5" />
                      <span>Rank #{university.ranking || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleShortlist}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isShortlisted
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    <StarIcon className="w-5 h-5 mr-2 inline" />
                    {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                  </button>
                  <button
                    onClick={handleLock}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isLocked
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    <LockClosedIcon className="w-5 h-5 mr-2 inline" />
                    {isLocked ? 'Locked' : 'Lock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Overview</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                {university.description || 'No description available for this university.'}
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <AcademicCapIcon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{university.ranking || 'N/A'}</p>
                  <p className="text-sm text-gray-400">World Ranking</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{university.acceptanceChance || 'N/A'}</p>
                  <p className="text-sm text-gray-400">Acceptance Rate</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CurrencyDollarIcon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ${typeof university.tuitionFeePerYear === 'number' 
                      ? (university.tuitionFeePerYear / 1000).toFixed(0) + 'k'
                      : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400">Tuition/Year</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <UserGroupIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{university.placementRate || 'N/A'}%</p>
                  <p className="text-sm text-gray-400">Placement Rate</p>
                </div>
              </div>
            </motion.div>

            {/* Programs Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Programs</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <AcademicCapIcon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{university.program || 'Computer Science'}</h3>
                      <p className="text-sm text-gray-400">Bachelor's, Master's, PhD</p>
                    </div>
                  </div>
                  <span className="text-indigo-400 font-medium">4 Years</span>
                </div>
              </div>
            </motion.div>

            {/* Requirements Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Admission Requirements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Minimum GPA</p>
                      <p className="text-sm text-gray-400">{university.requirements?.minGPA || '3.0'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <LanguageIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">IELTS Score</p>
                      <p className="text-sm text-gray-400">{university.requirements?.ielts || '6.5'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">GRE Score</p>
                      <p className="text-sm text-gray-400">{university.requirements?.gre || '300'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Application Deadline</p>
                      <p className="text-sm text-gray-400">December 15, 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Why This University Section */}
            {university.whyItFits && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Why This University?</h2>
                <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg p-6">
                  <p className="text-gray-300 leading-relaxed">{university.whyItFits}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-8">
            {/* AI Analysis Card */}
            {user && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <SparklesIcon className="w-6 h-6 text-indigo-200" />
                  <h3 className="text-xl font-bold text-white">AI Analysis</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-indigo-200 text-sm mb-1">Fit Score</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white/20 rounded-full h-3">
                        <div 
                          className="bg-white rounded-full h-3 transition-all duration-500"
                          style={{ width: `${university.fitScore || 50}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-bold">{university.fitScore || 50}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-indigo-200 text-sm mb-1">Acceptance Chance</p>
                    <p className="text-white text-lg font-semibold">{university.acceptanceChance || 'Medium'}</p>
                  </div>
                  <div>
                    <p className="text-indigo-200 text-sm mb-2">Recommendation</p>
                    <p className="text-white text-sm leading-relaxed">
                      {university.matchReason || 'Complete your profile to get personalized recommendations'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-6">Quick Info</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Type</span>
                  <span className="text-white font-medium">{university.universityType || 'Private'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Cost Level</span>
                  <span className="text-white font-medium">{university.costLevel || 'High'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Competitiveness</span>
                  <span className="text-white font-medium">{university.competitiveness || 'High'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Avg Salary</span>
                  <span className="text-white font-medium">${university.averageSalary || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Internships</span>
                  <span className="text-white font-medium">{university.internshipOpportunities || 'High'}</span>
                </div>
              </div>
            </motion.div>

            {/* Actions Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-6">Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleApplyNow}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <DocumentTextIcon className="w-5 h-5" />
                  Apply Now
                </button>
                <button 
                  onClick={handleSaveForLater}
                  className={`w-full py-3 px-4 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    isShortlisted 
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <BookmarkIcon className="w-5 h-5" />
                  {isShortlisted ? 'Saved' : 'Save for Later'}
                </button>
                <button 
                  onClick={handleShareUniversity}
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ShareIcon className="w-5 h-5" />
                  Share University
                </button>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-6">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">Admissions Office</span>
                </div>
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">Mon-Fri: 9AM-5PM</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
