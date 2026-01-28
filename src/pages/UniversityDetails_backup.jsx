import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { StaggerContainer, SlideInUp } from "../components/AnimatedContainer";
import { Logo3D } from "../components/Logo3D";
import { getUniversityById } from "../helpers/endpoints.js";
import {
  ArrowLeftIcon,
  HeartIcon,
  LockClosedIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CalendarIcon,
  SparklesIcon,
  BriefcaseIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

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
    } catch (error) {
      console.error("Failed to shortlist university:", error);
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
    } catch (error) {
      console.error("Failed to lock university:", error);
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

  if (error || !university) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">University Not Found</h2>
          <p className="text-gray-300 mb-6">{error || "The university you're looking for doesn't exist or has been removed."}</p>
          <motion.button
            onClick={() => navigate("/universities")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Back to Universities
          </motion.button>
        </div>
      </div>
    );
  }

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

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate("/universities")}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          className="mb-8 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white hover:bg-white/20 hover:border-white/30 transition-all"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Universities
        </motion.button>

        {/* University Header */}
        <StaggerContainer delay={0.2}>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-white/30 transition-all duration-300">
            {/* Hero Image */}
            <div className="relative h-80">
              <img 
                src={university.image || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"} 
                alt={university.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
                }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Category Badge */}
              <div className="absolute top-6 right-6">
                <div className={`px-3 py-1 bg-gradient-to-r ${getCategoryColor(university.category)} text-white text-xs font-semibold rounded-full shadow-lg`}>
                  {university.category || 'University'}
                </div>
              </div>
              
              {/* University Name Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                  {university.name}
                </h1>
                <div className="flex items-center gap-2 text-white/90 text-lg drop-shadow">
                  <GlobeAltIcon className="w-5 h-5" />
                  <span>{university.country}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="bg-white/5 backdrop-blur-lg px-8 py-6 border-t border-white/10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300 group-hover:bg-white/15">
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mx-auto mb-4 shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                      <ChartBarIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">#{university.ranking || 'N/A'}</div>
                    <div className="text-sm text-gray-300 font-medium">World Rank</div>
                    <div className="mt-3 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300 group-hover:bg-white/15">
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mx-auto mb-4 shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                      <TrophyIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{university.placementRate || 'N/A'}%</div>
                    <div className="text-sm text-gray-300 font-medium">Placement Rate</div>
                    <div className="mt-3 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 group-hover:bg-white/15">
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                      <CurrencyDollarIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">${university.tuitionFeePerYear?.toLocaleString() || 'N/A'}</div>
                    <div className="text-sm text-gray-300 font-medium">Annual Tuition</div>
                    <div className="mt-3 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-orange-400/50 transition-all duration-300 group-hover:bg-white/15">
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mx-auto mb-4 shadow-lg group-hover:shadow-orange-500/25 transition-all duration-300">
                      <BriefcaseIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{university.acceptanceChance || 'N/A'}</div>
                    <div className="text-sm text-gray-300 font-medium">Acceptance Chance</div>
                    <div className="mt-3 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Academic Information */}
            <SlideInUp delay={0.3}>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <AcademicCapIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Academic Information</h2>
                </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <span className="font-medium text-gray-300">Program</span>
                        <span className="text-white font-semibold">{university.program || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <span className="font-medium text-gray-300">Cost Level</span>
                        <span className="text-white font-semibold">{university.costLevel || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <span className="font-medium text-gray-300">Competitiveness</span>
                        <span className="text-white font-semibold">{university.competitiveness || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <span className="font-medium text-gray-300">Internship Opportunities</span>
                        <span className="text-white font-semibold">{university.internshipOpportunities || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <span className="font-medium text-gray-300">Average Salary</span>
                        <span className="text-white font-semibold">${university.averageSalary || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </SlideInUp>

                {/* Admission Requirements */}
                <SlideInUp delay={0.4}>
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                        <CheckCircleIcon className="w-6 h-6 text-green-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Admission Requirements</h2>
                    </div>
                    
                    {university.requirements && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <span className="font-medium text-gray-300">Minimum GPA</span>
                          <span className="text-white font-semibold">{university.requirements.minGPA || "Not specified"}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <span className="font-medium text-gray-300">IELTS Score</span>
                          <span className="text-white font-semibold">{university.requirements.ielts || "Not specified"}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <span className="font-medium text-gray-300">GRE Score</span>
                          <span className="text-white font-semibold">{university.requirements.gre || "Not specified"}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <span className="font-medium text-gray-300">SOP Required</span>
                          <span className="text-white font-semibold">{university.requirements.sop ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <span className="font-medium text-gray-300">Recommendation Letters</span>
                          <span className="text-white font-semibold">{university.requirements.recommendationLetters || "Not specified"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </SlideInUp>
              </div>

              {/* Additional Information */}
              <SlideInUp delay={0.5}>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-white/20">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Additional Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {university.description && (
                      <div>
                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                          About
                        </h3>
                        <p className="text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl">{university.description}</p>
                      </div>
                    )}
                    
                    {university.whyItFits && (
                      <div>
                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <StarIcon className="w-5 h-5 text-gray-400" />
                          Why It Fits
                        </h3>
                        <p className="text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl">{university.whyItFits}</p>
                      </div>
                    )}
                    
                    {university.risks && (
                      <div>
                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />
                          Risks to Consider
                        </h3>
                        <p className="text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl">{university.risks}</p>
                      </div>
                    )}
                  </div>
                </div>
              </SlideInUp>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Academic Information */}
            <SlideInUp delay={0.3}>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <AcademicCapIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Academic Information</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="font-medium text-gray-300">Program</span>
                    <span className="text-white font-semibold">{university.program || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="font-medium text-gray-300">Cost Level</span>
                    <span className="text-white font-semibold">{university.costLevel || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="font-medium text-gray-300">Competitiveness</span>
                    <span className="text-white font-semibold">{university.competitiveness || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="font-medium text-gray-300">Internship Opportunities</span>
                    <span className="text-white font-semibold">{university.internshipOpportunities || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="font-medium text-gray-300">Average Salary</span>
                    <span className="text-white font-semibold">${university.averageSalary || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </SlideInUp>

            {/* Admission Requirements */}
            <SlideInUp delay={0.4}>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Admission Requirements</h2>
                </div>
                
                {university.requirements && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="font-medium text-gray-300">Minimum GPA</span>
                      <span className="text-white font-semibold">{university.requirements.minGPA || "Not specified"}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="font-medium text-gray-300">IELTS Score</span>
                      <span className="text-white font-semibold">{university.requirements.ielts || "Not specified"}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="font-medium text-gray-300">GRE Score</span>
                      <span className="text-white font-semibold">{university.requirements.gre || "Not specified"}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="font-medium text-gray-300">SOP Required</span>
                      <span className="text-white font-semibold">{university.requirements.sop ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="font-medium text-gray-300">Recommendation Letters</span>
                      <span className="text-white font-semibold">{university.requirements.recommendationLetters || "Not specified"}</span>
                    </div>
                  </div>
                )}
              </div>
            </SlideInUp>
          </div>

          {/* Additional Information */}
          <SlideInUp delay={0.5}>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Additional Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {university.description && (
                  <div>
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                      About
                    </h3>
                    <p className="text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl">{university.description}</p>
                  </div>
                )}
                
                {university.whyItFits && (
                  <div>
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <StarIcon className="w-5 h-5 text-gray-400" />
                      Why It Fits
                    </h3>
                    <p className="text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl">{university.whyItFits}</p>
                  </div>
                )}
                
                {university.risks && (
                  <div>
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />
                      Risks to Consider
                    </h3>
                    <p className="text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl">{university.risks}</p>
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
