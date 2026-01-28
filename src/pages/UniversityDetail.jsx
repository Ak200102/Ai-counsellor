import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { StaggerContainer, SlideInUp } from "../components/AnimatedContainer";
import { Logo3D } from "../components/Logo3D";
import { getUniversityById } from "../helpers/endpoints.js";

export default function UniversityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUniversityDetails();
  }, [id]);

  const fetchUniversityDetails = async () => {
    try {
      console.log("Fetching university details for ID:", id);
      const response = await getUniversityById(id);
      console.log("University response:", response.data);
      setUniversity(response.data);
    } catch (err) {
      console.error("Failed to fetch university details:", err);
      console.error("Error details:", err.response?.data);
      setError("Failed to load university details");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "DREAM": return "from-purple-500 to-pink-500";
      case "TARGET": return "from-blue-500 to-cyan-500";
      case "SAFE": return "from-green-500 to-emerald-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getAcceptanceColor = (chance) => {
    switch (chance) {
      case "High": return "text-green-600 dark:text-green-400";
      case "Medium": return "text-yellow-600 dark:text-yellow-400";
      case "Low": return "text-red-600 dark:text-red-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const handleShortlist = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/universities/shortlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ universityId: id }),
      });
      
      if (response.ok) {
        setUniversity(prev => ({ ...prev, isShortlisted: true }));
      }
    } catch (err) {
      setError("Failed to shortlist university");
    }
  };

  const handleLock = async () => {
    if (!window.confirm("Are you sure you want to lock this university? This will unlock application guidance.")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/universities/lock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ universityId: id }),
      });
      
      if (response.ok) {
        setUniversity(prev => ({ ...prev, isLocked: true }));
        window.location.reload(); // Refresh to update stage
      }
    } catch (err) {
      setError("Failed to lock university");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-white text-xl"
        >
          ⏳ Loading...
        </motion.div>
      </div>
    );
  }

  if (error || !university) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-2xl font-bold text-white mb-2">University Not Found</h2>
          <p className="text-gray-300 mb-6">{error || "The university you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate("/universities")}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all"
          >
            Back to Universities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate("/universities")}
          whileHover={{ x: -5 }}
          className="mb-6 flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Universities
        </motion.button>

        {/* University Header */}
        <StaggerContainer delay={0.2}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-8">
            {/* Hero Image */}
            <div className="relative h-64 sm:h-80">
              <img 
                src={university.image || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"} 
                alt={university.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
                }}
              />
              {/* Category Badge Overlay */}
              <div className={`absolute top-4 right-4 px-4 py-2 bg-gradient-to-r ${getCategoryColor(university.category)} text-white text-sm font-semibold rounded-full shadow-lg`}>
                {university.category}
              </div>
              {/* Status Badges */}
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                {university.isShortlisted && (
                  <span className="px-3 py-1 bg-blue-500/90 text-white border border-blue-400 rounded-full text-xs font-medium">
                    ✓ Shortlisted
                  </span>
                )}
                {university.isLocked && (
                  <span className="px-3 py-1 bg-green-500/90 text-white border border-green-400 rounded-full text-xs font-medium">
                    🔒 Locked
                  </span>
                )}
              </div>
            </div>

            {/* University Info */}
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">{university.name}</h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {university.country}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-3">
                  {!university.isShortlisted && !university.isLocked && (
                    <button
                      onClick={handleShortlist}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Add to Shortlist
                    </button>
                  )}
                  {university.isShortlisted && !university.isLocked && (
                    <button
                      onClick={handleLock}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Lock University
                    </button>
                  )}
                  {university.isLocked && (
                    <button
                      disabled
                      className="px-6 py-3 bg-gray-100 text-gray-400 cursor-not-allowed rounded-lg font-medium"
                    >
                      University Locked
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">#{university.ranking}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">World Ranking</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${typeof university.tuitionFeePerYear === 'number' 
                      ? university.tuitionFeePerYear.toLocaleString() 
                      : university.tuitionFeePerYear?.amount 
                        ? university.tuitionFeePerYear.amount.toLocaleString()
                        : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Annual Tuition</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getAcceptanceColor(university.acceptanceChance)}`}>
                    {university.acceptanceChance}
                  </div>
                  <div className="text-sm text-gray-600">Acceptance Chance</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{university.placementRate}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Placement Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Academic Information */}
            <SlideInUp delay={0.3}>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Logo3D emoji="📚" size="sm" />
                  <span className="ml-2">Academic Information</span>
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Program</h3>
                    <p className="text-gray-600 dark:text-gray-300">{university.program}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cost Level</h3>
                    <p className="text-gray-600 dark:text-gray-300">{university.costLevel}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Competitiveness</h3>
                    <p className="text-gray-600 dark:text-gray-300">{university.competitiveness}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Internship Opportunities</h3>
                    <p className="text-gray-600">{university.internshipOpportunities}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Average Salary</h3>
                    <p className="text-gray-600">${university.averageSalary}</p>
                  </div>
                </div>
              </div>
            </SlideInUp>

            {/* Admission Requirements */}
            <SlideInUp delay={0.4}>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Logo3D emoji="🎯" size="sm" />
                  <span className="ml-2">Admission Requirements</span>
                </h2>
                
                {university.requirements && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Minimum GPA</h3>
                      <p className="text-gray-600">{university.requirements.minGPA || "Not specified"}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">IELTS Score</h3>
                      <p className="text-gray-600">{university.requirements.ielts || "Not specified"}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">GRE Score</h3>
                      <p className="text-gray-600">{university.requirements.gre || "Not specified"}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">SOP Required</h3>
                      <p className="text-gray-600">{university.requirements.sop ? "Yes" : "No"}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Recommendation Letters</h3>
                      <p className="text-gray-600">{university.requirements.recommendationLetters || "Not specified"}</p>
                    </div>
                  </div>
                )}
              </div>
            </SlideInUp>
          </div>

          {/* Additional Information */}
          <SlideInUp delay={0.5}>
            <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Logo3D emoji="📖" size="sm" />
                <span className="ml-2">Additional Information</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {university.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-600">{university.description}</p>
                  </div>
                )}
                
                {university.whyItFits && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Why It Fits</h3>
                    <p className="text-gray-600">{university.whyItFits}</p>
                  </div>
                )}
                
                {university.risks && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Risks to Consider</h3>
                    <p className="text-gray-600">{university.risks}</p>
                  </div>
                )}
              </div>
            </div>
          </SlideInUp>
        </StaggerContainer>
      </div>
    </div>
  );
}
