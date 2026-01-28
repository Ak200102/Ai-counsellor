import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getUniversities, getUniversityById, shortlistUniversity, unshortlistUniversity, lockUniversity, unlockUniversity, getMe, askCounsellor } from "../helpers/endpoints";
import withAiCounsellingCheck from "../components/withAiCounsellingCheck";
import eventBus from "../utils/eventBus";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
  LockClosedIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  MapPinIcon,
  SparklesIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  HeartIcon,
  ShareIcon,
  BookmarkIcon,
  InformationCircleIcon,
  FireIcon,
  TrophyIcon,
  StarIcon as StarIconSolid
} from "@heroicons/react/24/outline";

export default withAiCounsellingCheck(Universities, "Universities");

function Universities() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("ranking");
  const [user, setUser] = useState(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [currentStage, setCurrentStage] = useState("discovery");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchUniversities();
    
    // Check if lock action happened in AI Counsellor
    const lastLockTime = sessionStorage.getItem('lastUniversityLock');
    if (lastLockTime) {
      console.log('Detected recent lock action, refreshing universities data...');
      fetchUniversities();
      sessionStorage.removeItem('lastUniversityLock');
    }
    
    // Listen for events from AI Counsellor using event bus
    const handleUniversityUpdate = (data) => {
      console.log('University update event received via eventBus:', data);
      console.log('Refreshing universities data...');
      fetchUniversities();
    };
    
    // Refresh data when page gets focus (user returns from AI Counsellor)
    const handleFocus = () => {
      console.log('Page focused, refreshing universities data...');
      fetchUniversities();
    };
    
    // Check if user navigated from AI Counsellor
    const navigationEntries = performance.getEntriesByType('navigation');
    const lastNavigation = navigationEntries[navigationEntries.length - 1];
    if (lastNavigation && lastNavigation.type === 'navigate') {
      console.log('Page navigation detected, refreshing data...');
      fetchUniversities();
    }
    
    eventBus.on('universityUpdate', handleUniversityUpdate);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      eventBus.off('universityUpdate', handleUniversityUpdate);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch user data from database
      const userResponse = await getMe();
      const userData = userResponse.data || userResponse;
      
      if (userData) {
        setUser(userData);
        
        // Check if user has completed onboarding (this should come from user profile in database)
        const isOnboardingComplete = userData.onboardingCompleted || false;
        const userStage = userData.stage || 'ONBOARDING';
        
        setOnboardingComplete(isOnboardingComplete);
        setCurrentStage(userStage);
        
        // Fetch AI recommendations if user has profile data
        if (userData.profile) {
          fetchAIRecommendations();
        }
        
        if (!isOnboardingComplete) {
          // Redirect to onboarding if not completed
          navigate("/onboarding");
          return;
        }
      } else {
        // No user data found, redirect to login
        navigate("/auth/login");
        return;
      }
    } catch (error) {
      console.error("Failed to fetch user data from database:", error);
      // If API fails, redirect to login
      navigate("/auth/login");
    }
  };

  const fetchAIRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      
      // Build profile context for AI
      const profile = user?.profile || {};
      const profileMessage = `
        My profile details:
        - Academic Level: ${profile.academic?.level || 'Not specified'}
        - Major: ${profile.academic?.major || 'Not specified'}
        - GPA: ${profile.academic?.gpa || 'Not specified'}
        - Study Goal Degree: ${profile.studyGoal?.degree || 'Not specified'}
        - Study Goal Field: ${profile.studyGoal?.field || 'Not specified'}
        - Budget Range: ${profile.budget?.range || 'Not specified'}
        - Preferred Countries: ${profile.studyGoal?.preferredCountries?.join(', ') || 'Not specified'}
        - IELTS Score: ${profile.exams?.ielts?.score || 'Not specified'}
        - GRE Score: ${profile.exams?.gre?.score || 'Not specified'}
        
        Based on this profile, what universities do you recommend for me? Please provide specific university names with categories (Dream, Target, Safe) and acceptance chances.
      `;
      
      const response = await askCounsellor(profileMessage);
      console.log("AI Recommendations Response:", response.data);
      
      setAiRecommendations(response.data);
      setLoadingRecommendations(false);
    } catch (error) {
      console.error("Error fetching AI recommendations:", error);
      setLoadingRecommendations(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await getUniversities();
      const responseData = response.data;
      
      // Handle different response structures from database
      let universityData = [];
      
      if (responseData.universities) {
        universityData = responseData.universities;
      } else if (Array.isArray(responseData)) {
        universityData = responseData;
      }
      
      // Process universities from database - use real data structure
      const universitiesWithCategories = universityData.map(uni => ({
        ...uni,
        // Use actual database fields - no dummy data
        category: uni.universityType || uni.category || 'GENERAL',
        // Backend provides these fields from AI analysis
        shortlisted: uni.isShortlisted || false,
        locked: uni.isLocked || false,
        acceptanceChance: uni.acceptanceChance || 'Unknown',
        fitScore: uni.fitScore || 50,
        matchReason: uni.matchReason || 'Complete your profile to see personalized recommendations',
        recommendation: uni.recommendation || '🎓 Complete your profile to get personalized recommendations',
        shortlistCategory: uni.shortlistCategory || null,
        // Use real database fields
        tuitionFeePerYear: uni.tuitionFeePerYear || 0,
        acceptanceRate: uni.acceptanceChance || 'Unknown',
        ranking: uni.ranking || 999,
        location: uni.country || 'Unknown',
        image: uni.image || null,
        // Backend provides these fields
        universityType: uni.universityType,
        costLevel: uni.costLevel,
        competitiveness: uni.competitiveness,
        isActive: uni.isActive,
        // Additional real fields
        program: uni.program || 'Not specified',
        internshipOpportunities: uni.internshipOpportunities || 'Unknown',
        placementRate: uni.placementRate || 0,
        averageSalary: uni.averageSalary || 'Not specified',
        requirements: uni.requirements || {},
        description: uni.description || 'No description available',
        whyItFits: uni.whyItFits || null,
        risks: uni.risks || null
      }));
      
      setUniversities(universitiesWithCategories);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch universities from database:", error);
      setError("Failed to load universities from database");
      setLoading(false);
    }
  };

  const handleShortlist = async (universityId) => {
    try {
      const university = universities.find(u => u._id === universityId);
      
      if (university.shortlisted) {
        // Remove from shortlist
        await unshortlistUniversity(universityId);
        setUniversities(prev => prev.map(uni => 
          uni._id === universityId 
            ? { ...uni, shortlisted: false }
            : uni
        ));
        console.log(`📌 ${university.name} removed from shortlist`);
      } else {
        // Call API to shortlist university in MongoDB
        await shortlistUniversity(universityId);
        
        // Update local state to reflect change immediately
        setUniversities(prev => prev.map(uni => 
          uni._id === universityId 
            ? { ...uni, shortlisted: true }
            : uni
        ));
        console.log(`✅ ${university.name} shortlisted in MongoDB!`);
        
      }
      
    } catch (error) {
      console.error("Failed to shortlist university:", error);
      setMessage("Failed to shortlist university in database. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLock = async (universityId) => {
    try {
      // Check if user already has a locked university
      const alreadyLockedUniversity = universities.find(u => u.locked && u._id !== universityId);
      
      if (alreadyLockedUniversity) {
        setMessage(`You already have ${alreadyLockedUniversity.name} locked. Unlock it first to lock another university.`);
        setMessageType("error");
        setTimeout(() => setMessage(""), 5000);
        return;
      }
      
      // Check if university is shortlisted
      const targetUniversity = universities.find(u => u._id === universityId);
      if (!targetUniversity.shortlisted) {
        setMessage("Please shortlist this university first before locking it.");
        setMessageType("error");
        setTimeout(() => setMessage(""), 5000);
        return;
      }
      
      // Call API to lock/unlock university in MongoDB
      if (targetUniversity.locked) {
        // Unlock the university
        await unlockUniversity();
        console.log(`🔓 ${targetUniversity.name} unlocked in MongoDB`);
        // Update user stage if needed
        setCurrentStage("DISCOVERING_UNIVERSITIES");
      } else {
        // Lock the university
        await lockUniversity(universityId);
        console.log(`🔒 ${targetUniversity.name} locked in MongoDB`);
        // Update user stage if needed
        setCurrentStage("PREPARING_APPLICATIONS");
      }
      
      // Update local state to reflect change immediately
      setUniversities(prev => prev.map(uni => 
        uni._id === universityId 
          ? { ...uni, locked: !uni.locked }
          : uni
      ));
      
      const university = universities.find(u => u._id === universityId);
      if (targetUniversity.locked) {
        setMessage(`Unlocked ${targetUniversity.name}. You can now explore other options.`);
      } else {
        setMessage(`Locked ${targetUniversity.name}! Your application journey begins here. 🎓`);
      }
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
      
    } catch (error) {
      console.error("Failed to lock university:", error);
      
      // Show specific error message from backend if available
      let errorMessage = "Failed to lock university in database. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setMessage(errorMessage);
      setMessageType("error");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const stats = {
    total: universities.length,
    shortlisted: universities.filter(u => u.shortlisted).length,
    locked: universities.filter(u => u.locked).length,
    dream: universities.filter(u => u.category === 'DREAM').length,
    target: universities.filter(u => u.category === 'TARGET').length,
    safe: universities.filter(u => u.category === 'SAFE').length,
    general: universities.filter(u => u.category === 'GENERAL').length,
    highAcceptance: universities.filter(u => u.acceptanceChance === 'High').length,
    mediumAcceptance: universities.filter(u => u.acceptanceChance === 'Medium').length,
    lowAcceptance: universities.filter(u => u.acceptanceChance === 'Low').length,
    extreme: universities.filter(u => u.competitiveness === 'Extreme').length,
    high: universities.filter(u => u.competitiveness === 'High').length,
    medium: universities.filter(u => u.competitiveness === 'Medium').length,
    low: universities.filter(u => u.competitiveness === 'Low').length
  };

  // Filter and sort universities
  const filteredUniversities = universities.filter(university => {
    const matchesSearch = university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         university.program?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         university.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
                           university.category === categoryFilter ||
                           university.competitiveness === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const sortedUniversities = [...filteredUniversities].sort((a, b) => {
    if (sortBy === 'ranking') return (a.ranking || 999) - (b.ranking || 999);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'tuition') return (a.tuitionFeePerYear || 0) - (b.tuitionFeePerYear || 0);
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading universities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => fetchUniversities()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
          >
            Retry
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
      
      {/* AI Counsellor Header */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stage Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <AcademicCapIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Universities</h1>
                  <p className="text-gray-300">Discover your perfect academic match</p>
                  {universities.some(u => u.locked) && (
                    <div className="flex items-center gap-2 mt-1">
                      <LockClosedIcon className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-400">
                        Locked: {universities.find(u => u.locked)?.name || 'University'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate("/compare")}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                <ChartBarIcon className="w-5 h-5" />
                Compare Universities
              </button>
            </div>
            
            {/* Progress Stages */}
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-lg rounded-xl p-4">
              {[
                { stage: 'onboarding', label: 'Onboarding', completed: onboardingComplete },
                { stage: 'discovery', label: 'Discovery', completed: currentStage === 'discovery' || currentStage === 'shortlisting' || currentStage === 'locked' },
                { stage: 'shortlisting', label: 'Shortlisting', completed: currentStage === 'shortlisting' || currentStage === 'locked' },
                { stage: 'locked', label: 'Decision', completed: currentStage === 'locked' },
                { stage: 'application', label: 'Application', completed: false }
              ].map((step, index) => (
                <div key={step.stage} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.completed 
                      ? "bg-green-500 text-white" 
                      : currentStage === step.stage 
                      ? "bg-indigo-600 text-white" 
                      : "bg-gray-600 text-gray-300"
                  }`}>
                    {step.completed ? "✓" : index + 1}
                  </div>
                  {index < 4 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step.completed ? "bg-green-500" : "bg-gray-600"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">AI Recommendations for You</h2>
                  <p className="text-indigo-100">
                    Based on your profile: {user.profile?.academic?.major || user.profile?.studyGoal?.field || 'Not specified'}, 
                    GPA: {user.profile?.academic?.gpa || 'Not specified'}, 
                    Budget: {user.profile?.budget?.range || 'Not specified'}
                  </p>
                </div>
                <SparklesIcon className="w-8 h-8 text-indigo-200" />
              </div>

              {loadingRecommendations ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="ml-3 text-white">Getting AI recommendations...</span>
                </div>
              ) : aiRecommendations && aiRecommendations.collegeRecommendations ? (
                <div className="space-y-6">
                  {/* University Categories */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(() => {
                      const dreamUnis = aiRecommendations.collegeRecommendations.filter(u => u.category === 'DREAM');
                      const targetUnis = aiRecommendations.collegeRecommendations.filter(u => u.category === 'TARGET');
                      const safeUnis = aiRecommendations.collegeRecommendations.filter(u => u.category === 'SAFE');
                      
                      return (
                        <>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">Dream Universities</span>
                              <FireIcon className="w-5 h-5 text-orange-300" />
                            </div>
                            <p className="text-3xl font-bold text-white">{dreamUnis.length}</p>
                            <p className="text-indigo-200 text-sm">Ambitious choices</p>
                            {dreamUnis.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {dreamUnis.slice(0, 2).map((uni, index) => (
                                  <p key={index} className="text-xs text-indigo-100 truncate">{uni.name}</p>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">Target Universities</span>
                              <TrophyIcon className="w-5 h-5 text-yellow-300" />
                            </div>
                            <p className="text-3xl font-bold text-white">{targetUnis.length}</p>
                            <p className="text-indigo-200 text-sm">Realistic matches</p>
                            {targetUnis.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {targetUnis.slice(0, 2).map((uni, index) => (
                                  <p key={index} className="text-xs text-indigo-100 truncate">{uni.name}</p>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">Safe Universities</span>
                              <CheckCircleIcon className="w-5 h-5 text-green-300" />
                            </div>
                            <p className="text-3xl font-bold text-white">{safeUnis.length}</p>
                            <p className="text-indigo-200 text-sm">Secure options</p>
                            {safeUnis.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {safeUnis.slice(0, 2).map((uni, index) => (
                                  <p key={index} className="text-xs text-indigo-100 truncate">{uni.name}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* Acceptance Chances */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(() => {
                      const highAccept = aiRecommendations.collegeRecommendations.filter(u => u.acceptanceProbability === 'High');
                      const mediumAccept = aiRecommendations.collegeRecommendations.filter(u => u.acceptanceProbability === 'Medium');
                      const lowAccept = aiRecommendations.collegeRecommendations.filter(u => u.acceptanceProbability === 'Low');
                      
                      return (
                        <>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">High Acceptance</span>
                              <CheckCircleIcon className="w-5 h-5 text-green-300" />
                            </div>
                            <p className="text-3xl font-bold text-white">{highAccept.length}</p>
                            <p className="text-indigo-200 text-sm">Good chances</p>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">Medium Acceptance</span>
                              <ChartBarIcon className="w-5 h-5 text-yellow-300" />
                            </div>
                            <p className="text-3xl font-bold text-white">{mediumAccept.length}</p>
                            <p className="text-indigo-200 text-sm">Competitive</p>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">Low Acceptance</span>
                              <ExclamationTriangleIcon className="w-5 h-5 text-red-300" />
                            </div>
                            <p className="text-3xl font-bold text-white">{lowAccept.length}</p>
                            <p className="text-indigo-200 text-sm">Very selective</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* AI Message */}
                  {aiRecommendations.message && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-4">
                      <p className="text-white text-sm leading-relaxed">{aiRecommendations.message}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <SparklesIcon className="w-12 h-12 text-indigo-200 mx-auto mb-3" />
                  <p className="text-white">Complete your profile to get personalized AI recommendations</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Search Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search universities, programs, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Categories</option>
                  <option value="DREAM">Dream</option>
                  <option value="TARGET">Target</option>
                  <option value="SAFE">Safe</option>
                  <option value="HIGH">High Competition</option>
                  <option value="MEDIUM">Medium Competition</option>
                  <option value="LOW">Low Competition</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ranking">Sort by Ranking</option>
                  <option value="name">Sort by Name</option>
                  <option value="tuition">Sort by Tuition</option>
                </select>
              </div>
            </div>
          </div>

          {/* Universities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {sortedUniversities.map((university, index) => (
                <motion.div
                  key={university._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  {/* University Card */}
                  <div 
                    className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:border-white/30 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/university/${university._id}`)}
                  >
                    {/* University Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={university.image || "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"}
                        alt={university.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
                        }}
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          university.category === 'DREAM' ? 'bg-orange-500/80 backdrop-blur-sm' :
                          university.category === 'TARGET' ? 'bg-yellow-500/80 backdrop-blur-sm' :
                          university.category === 'SAFE' ? 'bg-green-500/80 backdrop-blur-sm' :
                          'bg-gray-500/80 backdrop-blur-sm'
                        }`}>
                          {university.category || 'GENERAL'}
                        </div>
                      </div>
                      
                      {/* Status Badges */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        {university.shortlisted && (
                          <div className="px-3 py-1 bg-yellow-500/80 backdrop-blur-sm rounded-full">
                            <StarIconSolid className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {university.locked && (
                          <div className="px-3 py-1 bg-red-500/80 backdrop-blur-sm rounded-full">
                            <LockClosedIcon className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* University Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-white font-bold text-xl mb-1">{university.name}</h3>
                        <div className="flex items-center text-gray-300 text-sm">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          {university.location}
                        </div>
                      </div>
                    </div>

                    {/* University Details */}
                    <div className="p-6">
                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">#{university.ranking || 'N/A'}</p>
                          <p className="text-xs text-gray-400">Rank</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">
                            ${typeof university.tuitionFeePerYear === 'number' 
                              ? (university.tuitionFeePerYear / 1000).toFixed(0) + 'k'
                              : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400">Tuition</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">{university.acceptanceChance || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">Acceptance</p>
                        </div>
                      </div>

                      {/* AI Analysis */}
                      {user && (
                        <div className="bg-indigo-500/10 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <SparklesIcon className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm font-medium text-indigo-300">AI Analysis</span>
                          </div>
                          <p className="text-xs text-gray-300">
                            {university.matchReason || 'Complete your profile to see personalized recommendations'}
                          </p>
                          {university.fitScore && (
                            <p className="text-xs text-gray-400 mt-1">
                              Fit Score: {university.fitScore}/100
                            </p>
                          )}
                          {university.recommendation && university.recommendation !== '🎓 Complete your profile to get personalized recommendations' && (
                            <p className="text-xs text-gray-400 mt-1">
                              {university.recommendation}
                            </p>
                          )}
                          {university.acceptanceChance && university.acceptanceChance !== 'Unknown' && (
                            <p className="text-xs text-gray-400 mt-1">
                              Acceptance Chance: {university.acceptanceChance}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-gray-300 text-sm mb-6 line-clamp-2">
                        {university.description || 'No description available'}
                      </p>

                      {/* Additional Info */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                        <div>
                          <p className="text-gray-400">Program:</p>
                          <p className="text-white font-medium">{university.program || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Placement Rate:</p>
                          <p className="text-white font-medium">{university.placementRate || 'N/A'}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Avg Salary:</p>
                          <p className="text-white font-medium">${university.averageSalary || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Internships:</p>
                          <p className="text-white font-medium">{university.internshipOpportunities || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleShortlist(university._id);
                          }}
                          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                            university.shortlisted
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                              : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                          }`}
                        >
                          <StarIcon className="w-4 h-4 mr-2 inline" />
                          {university.shortlisted ? 'Shortlisted' : 'Shortlist'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleLock(university._id);
                          }}
                          disabled={universities.some(u => u.locked && u._id !== university._id)}
                          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                            university.locked
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : universities.some(u => u.locked && u._id !== university._id)
                              ? 'bg-gray-600 text-white cursor-not-allowed opacity-50'
                              : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                          }`}
                        >
                          <LockClosedIcon className="w-4 h-4 mr-2 inline" />
                          {university.locked ? 'Locked' : universities.some(u => u.locked && u._id !== university._id) ? 'Locked Another' : 'Lock'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
            ))}
          </AnimatePresence>
        </div>
        </div>
      </div>
    </div>
  );
}
