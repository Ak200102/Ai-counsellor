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
        - Major/Field of Study: ${profile.academic?.major || profile.academic?.fieldOfStudy || 'Not specified'}
        - GPA: ${profile.academic?.gpa || 'Not specified'}
        - Study Goal Degree: ${profile.studyGoal?.degree || 'Not specified'}
        - Study Goal Field: ${profile.studyGoal?.field || profile.studyGoal?.intendedMajor || 'Not specified'}
        - Career Goals: ${profile.careerGoals?.shortTerm || profile.careerGoals?.longTerm || profile.careerGoals?.aspirations || 'Not specified'}
        - Industry Interest: ${profile.careerGoals?.industry || profile.careerGoals?.sector || 'Not specified'}
        - Job Role Aspirations: ${profile.careerGoals?.jobRole || profile.careerGoals?.position || 'Not specified'}
        - Budget Range: ${profile.budget?.range || profile.budget?.annual || 'Not specified'}
        - Preferred Countries: ${profile.studyGoal?.preferredCountries?.join(', ') || profile.studyGoal?.countries?.join(', ') || 'Not specified'}
        - IELTS Score: ${profile.exams?.ielts?.score || 'Not specified'}
        - GRE Score: ${profile.exams?.gre?.score || 'Not specified'}
        - Work Experience: ${profile.experience?.years || profile.experience?.duration || 'Not specified'} years
        - Skills: ${profile.skills?.technical?.join(', ') || profile.skills?.all?.join(', ') || 'Not specified'}
        
        Based on this comprehensive profile including my field of study (${profile.academic?.major || profile.academic?.fieldOfStudy || 'Not specified'}) 
        and career goals (${profile.careerGoals?.shortTerm || profile.careerGoals?.aspirations || 'Not specified'}), 
        what universities do you recommend for me? Please provide specific university names with categories (Dream, Target, Safe) 
        and acceptance chances that align with my academic background and career aspirations.
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
  console.log('=== CATEGORY FILTER DEBUG ===');
  console.log('Current category filter:', categoryFilter);
  console.log('Total universities before filter:', universities.length);
  
  const filteredUniversities = universities.filter(university => {
    const matchesSearch = university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (university.program && university.program.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (university.location && university.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (university.country && university.country.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' ||
      university.category?.toLowerCase() === categoryFilter.toLowerCase() ||
      university.universityType?.toLowerCase() === categoryFilter.toLowerCase() ||
      university.competitiveness?.toLowerCase() === categoryFilter.toLowerCase();

    // Show debug for first few universities when category filter is not 'all'
    if (categoryFilter !== 'all' && universities.indexOf(university) < 5) {
      console.log('University:', university.name);
      console.log('  - category:', university.category);
      console.log('  - universityType:', university.universityType);
      console.log('  - competitiveness:', university.competitiveness);
      console.log('  - matchesCategory:', matchesCategory);
    }

    return matchesSearch && matchesCategory;
  });
  
  console.log('Universities after filter:', filteredUniversities.length);
  console.log('============================');

  const sortedUniversities = [...filteredUniversities].sort((a, b) => {
    if (sortBy === 'ranking') {
      const aRank = a.ranking || a.rank || 999;
      const bRank = b.ranking || b.rank || 999;
      return aRank - bRank;
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'tuition') {
      const aTuition = a.tuitionFeePerYear || a.tuition || a.cost || 0;
      const bTuition = b.tuitionFeePerYear || b.tuition || b.cost || 0;
      return aTuition - bTuition;
    }
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
          <div className={`p-4 rounded-lg border ${messageType === 'success'
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
                { 
                  stage: 'onboarding', 
                  label: 'Onboarding', 
                  completed: onboardingComplete,
                  current: currentStage === 'ONBOARDING'
                },
                { 
                  stage: 'discovery', 
                  label: 'Discovery', 
                  completed: onboardingComplete && universities.length > 0,
                  current: currentStage === 'DISCOVERING_UNIVERSITIES'
                },
                { 
                  stage: 'shortlisting', 
                  label: 'Shortlisting', 
                  completed: universities.filter(u => u.shortlisted).length > 0,
                  current: universities.filter(u => u.shortlisted).length > 0 && !universities.some(u => u.locked)
                },
                { 
                  stage: 'locked', 
                  label: 'Decision', 
                  completed: universities.some(u => u.locked),
                  current: universities.some(u => u.locked)
                },
                { 
                  stage: 'application', 
                  label: 'Application', 
                  completed: false, // This would be updated when applications are submitted
                  current: false // This would be updated when in application phase
                }
              ].map((step, index) => (
                <div key={step.stage} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.completed
                      ? "bg-green-500 text-white"
                      : step.current
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
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="appearance-none w-full px-5 py-4 pr-12 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/50 rounded-2xl text-white text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 backdrop-blur-xl transition-all duration-300 hover:border-slate-500/50 hover:from-slate-800/95 hover:to-slate-900/95 cursor-pointer shadow-2xl hover:shadow-indigo-500/20"
                  >
                    <option value="all" className="bg-slate-900 text-white">🎯 All Categories</option>
                    <option value="DREAM" className="bg-slate-900 text-white">🔥 Dream Universities</option>
                    <option value="TARGET" className="bg-slate-900 text-white">🎯 Target Universities</option>
                    <option value="SAFE" className="bg-slate-900 text-white">✅ Safe Universities</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none w-full px-5 py-4 pr-12 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/50 rounded-2xl text-white text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 backdrop-blur-xl transition-all duration-300 hover:border-slate-500/50 hover:from-slate-800/95 hover:to-slate-900/95 cursor-pointer shadow-2xl hover:shadow-indigo-500/20"
                  >
                    <option value="ranking" className="bg-slate-900 text-white">🏆 Sort by Ranking</option>
                    <option value="name" className="bg-slate-900 text-white">🔤 Sort by Name</option>
                    <option value="tuition" className="bg-slate-900 text-white">💰 Sort by Tuition</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
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
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 group"
                    onClick={() => navigate(`/university/${university._id}`)}
                  >
                    {/* Card Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-4">
                        {/* University Logo/Icon */}
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <AcademicCapIcon className="w-8 h-8 text-white" />
                        </div>

                        {/* Status Badges */}
                        <div className="flex gap-2">
                          {university.category && (
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${university.category === 'DREAM' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                university.category === 'TARGET' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  university.category === 'SAFE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                              }`}>
                              {university.category}
                            </div>
                          )}
                          {university.shortlisted && (
                            <div className="p-1.5 bg-yellow-100 rounded-full">
                              <StarIconSolid className="w-4 h-4 text-yellow-600" />
                            </div>
                          )}
                          {university.locked && (
                            <div className="p-1.5 bg-red-100 rounded-full">
                              <LockClosedIcon className="w-4 h-4 text-red-600" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* University Name and Location */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {university.name}
                      </h3>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                        <MapPinIcon className="w-4 h-4 mr-1.5" />
                        {university.location}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-xl font-bold text-gray-900 dark:text-white">#{university.ranking || 'N/A'}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Rank</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            ${typeof university.tuitionFeePerYear === 'number'
                              ? (university.tuitionFeePerYear / 1000).toFixed(0) + 'k'
                              : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Tuition</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{university.acceptanceChance || 'N/A'}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Acceptance</p>
                        </div>
                      </div>

                      {/* AI Analysis */}
                      {user && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <SparklesIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-300">AI Analysis</span>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                            {university.matchReason || 'Complete your profile to see personalized recommendations'}
                          </p>
                          {university.fitScore && (
                            <div className="mt-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400">Fit Score</span>
                                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{university.fitScore}/100</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div
                                  className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                  style={{ width: `${university.fitScore}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleShortlist(university._id);
                          }}
                          className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${university.shortlisted
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400'
                            }`}
                        >
                          {university.shortlisted ? (
                            <span className="flex items-center justify-center gap-1.5">
                              <StarIconSolid className="w-4 h-4" />
                              Shortlisted
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1.5">
                              <StarIcon className="w-4 h-4" />
                              Shortlist
                            </span>
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleLock(university._id);
                          }}
                          className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${university.locked
                              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}
                        >
                          {university.locked ? (
                            <span className="flex items-center justify-center gap-1.5">
                              <LockClosedIcon className="w-4 h-4" />
                              Locked
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1.5">
                              <LockClosedIcon className="w-4 h-4" />
                              Lock Decision
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div> {/* Close universities grid */}
        </div>
      </div>
    </div>
  );
}