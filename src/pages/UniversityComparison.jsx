import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getUniversities, getMe } from "../helpers/endpoints";
import {
  AcademicCapIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  StarIcon,
  XMarkIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  LockClosedIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";

export default function UniversityComparison() {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [selectedUniversities, setSelectedUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("ranking");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [universitiesResponse, userResponse] = await Promise.all([
        getUniversities(),
        getMe()
      ]);
      
      const universitiesData = universitiesResponse.data?.universities || universitiesResponse.data || [];
      const userData = userResponse.data || userResponse;
      
      setUniversities(universitiesData);
      setFilteredUniversities(universitiesData);
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = universities;

    if (searchTerm) {
      filtered = filtered.filter(uni => 
        uni.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(uni => uni.universityType === categoryFilter);
    }

    // Sort
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "ranking":
          return (a.ranking || Infinity) - (b.ranking || Infinity);
        case "name":
          return a.name?.localeCompare(b.name || "");
        case "cost":
          return (a.tuitionFeePerYear || 0) - (b.tuitionFeePerYear || 0);
        default:
          return 0;
      }
    });

    setFilteredUniversities(filtered);
  }, [searchTerm, categoryFilter, sortBy, universities]);

  const addToComparison = (university) => {
    if (selectedUniversities.length < 4 && !selectedUniversities.find(u => u._id === university._id)) {
      setSelectedUniversities([...selectedUniversities, university]);
    }
  };

  const removeFromComparison = (universityId) => {
    setSelectedUniversities(selectedUniversities.filter(u => u._id !== universityId));
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Dream": return "from-purple-600 to-pink-600";
      case "Target": return "from-blue-600 to-cyan-600";
      case "Safe": return "from-green-600 to-emerald-600";
      default: return "from-gray-600 to-gray-700";
    }
  };

  const getAcceptanceColor = (competitiveness) => {
    switch (competitiveness) {
      case "Extreme": return "text-red-600 dark:text-red-400";
      case "High": return "text-orange-600 dark:text-orange-400";
      case "Medium": return "text-yellow-600 dark:text-yellow-400";
      case "Low": return "text-green-600 dark:text-green-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading universities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            rotate: [0, 360]
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">University Comparison</h1>
              <p className="text-gray-300">Compare universities side by side to make the best choice</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/universities")}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-lg text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
          >
            Back to Universities
          </button>
        </div>

        {/* Selected Universities Summary */}
        {selectedUniversities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Selected for Comparison ({selectedUniversities.length}/4)</h2>
              <button
                onClick={() => setSelectedUniversities([])}
                className="text-white/80 hover:text-white text-sm"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedUniversities.map((university) => (
                <div key={university._id} className="bg-white/10 backdrop-blur-lg rounded-lg p-4 relative border border-white/20">
                  <button
                    onClick={() => removeFromComparison(university._id)}
                    className="absolute top-2 right-2 p-1 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={university.logo || "/placeholder-university.png"}
                      alt={university.name}
                      className="w-12 h-12 object-contain"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm">{university.name}</h3>
                      <p className="text-xs text-gray-300">{university.country}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-300">
                    <div>Ranking: #{university.ranking || 'N/A'}</div>
                    <div>Fees: ${university.tuitionFeePerYear || 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all" className="bg-gray-800">All Categories</option>
                <option value="Dream" className="bg-gray-800">Dream</option>
                <option value="Target" className="bg-gray-800">Target</option>
                <option value="Safe" className="bg-gray-800">Safe</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ranking" className="bg-gray-800">Sort by Ranking</option>
                <option value="name" className="bg-gray-800">Sort by Name</option>
                <option value="cost" className="bg-gray-800">Sort by Cost</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Universities Grid */}
        <AnimatePresence mode="wait">
          {filteredUniversities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm ? "No universities found" : "No universities available"}
              </h3>
              <p className="text-gray-400">
                {searchTerm ? "Try adjusting your search terms" : "Check back later for new opportunities"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredUniversities.map((university, index) => {
                const isSelected = selectedUniversities.find(u => u._id === university._id);
                const isShortlisted = user?.profile?.shortlistedUniversities?.some(u => u._id === university._id);
                const isLocked = user?.profile?.lockedUniversity?._id === university._id;

                return (
                  <motion.div
                    key={university._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-white/30 transition-all duration-300 cursor-pointer group">
                      {/* University Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={university.image || "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"}
                          alt={university.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        {/* Category Badge */}
                        <div className="absolute top-4 right-4">
                          <div className={`px-3 py-1 bg-gradient-to-r ${getCategoryColor(university.universityType)} text-white text-xs font-semibold rounded-full shadow-lg`}>
                            {university.universityType}
                          </div>
                        </div>
                        
                        {/* Status Badges */}
                        <div className="absolute bottom-4 left-4 flex gap-2">
                          {isShortlisted && (
                            <span className="px-3 py-1 bg-blue-500/80 text-white border border-blue-400 rounded-full text-xs font-medium">
                              <StarIcon className="w-3 h-3 mr-1" />
                              Shortlisted
                            </span>
                          )}
                          {isLocked && (
                            <span className="px-3 py-1 bg-green-500/80 text-white border border-green-400 rounded-full text-xs font-medium">
                              <LockClosedIcon className="w-3 h-3 mr-1" />
                              Locked
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                          {university.name}
                        </h3>
                        <div className="flex items-center text-gray-300 text-sm mb-4">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          {university.country}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-white">#{university.ranking || 'N/A'}</div>
                            <div className="text-xs text-gray-400">Rank</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-white">
                              ${typeof university.tuitionFeePerYear === 'number' 
                                ? university.tuitionFeePerYear.toLocaleString() 
                                : university.tuitionFeePerYear?.amount 
                                  ? university.tuitionFeePerYear.amount.toLocaleString()
                                  : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-400">Tuition</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getAcceptanceColor(university.competitiveness)}`}>
                              {university.competitiveness || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-400">Competitive</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {!isShortlisted && !isLocked && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToComparison(university);
                              }}
                              disabled={isSelected || selectedUniversities.length >= 4}
                              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                                isSelected
                                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                  : selectedUniversities.length >= 4
                                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {isSelected ? 'Added' : selectedUniversities.length >= 4 ? 'Max Reached' : 'Compare'}
                            </button>
                          )}
                          {isShortlisted && !isLocked && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToComparison(university);
                              }}
                              disabled={isSelected || selectedUniversities.length >= 4}
                              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                                isSelected
                                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                  : selectedUniversities.length >= 4
                                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                              }`}
                            >
                              {isSelected ? 'Added' : selectedUniversities.length >= 4 ? 'Max Reached' : 'Compare'}
                            </button>
                          )}
                          {isLocked && (
                            <button
                              disabled
                              className="flex-1 py-2 px-3 bg-gray-600 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed"
                            >
                              <LockClosedIcon className="w-4 h-4 mr-1" />
                              Locked
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
