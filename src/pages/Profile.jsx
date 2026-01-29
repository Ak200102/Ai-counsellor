import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getMe, getTasks, getApplications, updateUser } from "../helpers/endpoints";
import { calculateProfileStrength } from "../helpers/profileUtils";
import api from "../helpers/api";
import { 
  UserIcon, 
  EnvelopeIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CameraIcon,
  CheckCircleIcon,
  PencilIcon,
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
  LockClosedIcon,
  UserGroupIcon,
  TrashIcon,
  BriefcaseIcon,
  XMarkIcon,
  CheckIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data || []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await getMe();
      
      // Handle different response structures
      const userData = response.data || response;
      
      setUser(userData);
      
      // Extract profile data with fallbacks
      const profile = userData.profile || {};
      
      // Simple check to see if onboarding data exists
      console.log('=== PROFILE LOADING CHECK ===');
      console.log('Has profile:', !!profile);
      console.log('All profile keys:', Object.keys(profile));
      console.log('Full profile object:', profile);
      console.log('Degree from DB:', profile?.degree);
      console.log('Subject from DB:', profile?.subject);
      console.log('IntendedDegree from DB:', profile?.intendedDegree);
      console.log('FieldOfStudy from DB:', profile?.fieldOfStudy);
      
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        bio: profile?.bio || "",
        // Academic Background - NESTED STRUCTURE
        degree: profile?.academic?.degree || "",
        subject: profile?.academic?.subject || "",
        university: profile?.academic?.university || "",
        graduationYear: profile?.academic?.graduationYear || "",
        gpa: profile?.academic?.gpa || "",
        // Study Goal - NESTED STRUCTURE
        intendedDegree: profile?.studyGoal?.intendedDegree || "",
        fieldOfStudy: profile?.studyGoal?.fieldOfStudy || "",
        intakeYear: profile?.studyGoal?.intakeYear || "",
        preferredCountries: profile?.studyGoal?.preferredCountries || [],
        // Budget - NESTED STRUCTURE
        budgetRange: profile?.budget?.range || "",
        fundingPlan: profile?.budget?.funding || "",
        // Standardized Tests - CHECK IF NESTED OR DIRECT
        ieltsTaken: profile?.ieltsTaken || profile?.exams?.ielts?.taken || false,
        ieltsScore: profile?.ieltsScore?.overall || profile?.exams?.ielts?.score || "",
        toeflTaken: profile?.toeflTaken || profile?.exams?.toefl?.taken || false,
        toeflScore: profile?.toeflScore?.total || profile?.exams?.toefl?.score || "",
        greTaken: profile?.greTaken || profile?.exams?.gre?.taken || false,
        greScore: profile?.greScore?.total || profile?.exams?.gre?.score || "",
        gmatTaken: profile?.gmatTaken || profile?.exams?.gmat?.taken || false,
        gmatScore: profile?.gmatScore?.total || profile?.exams?.gmat?.score || "",
        // Additional Academic Info - CHECK IF NESTED OR DIRECT
        workExperience: profile?.workExperience || profile?.experience?.description || "",
        researchExperience: profile?.researchExperience || profile?.experience?.research || "",
        publications: profile?.publications || profile?.experience?.publications || "",
        certifications: profile?.certifications || profile?.experience?.certifications || "",
        // Application Readiness - CHECK IF NESTED OR DIRECT
        sopStatus: profile?.sopStatus || profile?.application?.sop || "",
        lorStatus: profile?.lorStatus || profile?.application?.lor || "",
        resumeStatus: profile?.resumeStatus || profile?.application?.resume || ""
      });
      
      // Log what was actually set in formData
      console.log('=== FORM DATA SET ===');
      console.log('FormData degree:', formData.degree);
      console.log('FormData subject:', formData.subject);
      console.log('FormData intendedDegree:', formData.intendedDegree);
      console.log('FormData fieldOfStudy:', formData.fieldOfStudy);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log("=== FRONTEND SAVE START ===");
      console.log("Form data being sent:", formData);
      console.log("Token in localStorage:", localStorage.getItem('token'));
      
      const response = await updateUser(formData);
      console.log("Update response:", response);
      
      setUser(prev => ({ ...prev, ...formData }));
      setEditing(false);
      
      console.log("=== FRONTEND SAVE SUCCESS ===");
    } catch (error) {
      console.error("=== FRONTEND SAVE ERROR ===");
      console.error("Failed to update profile:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log("=== AVATAR UPLOAD START ===");
    console.log("File selected:", file.name, file.type, file.size);

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setUploadError("Please select an image file");
      return;
    }

    setUploadingAvatar(true);
    setUploadError("");
    setUploadSuccess("");
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      console.log("Making request to /api/user/avatar-upload");
      const response = await api.post('/api/user/avatar-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("Avatar upload response:", response);
      console.log("Response data:", response.data);

      if (response.data && response.data.avatar) {
        // Update local state immediately
        setUser(prev => ({ 
          ...prev, 
          avatar: response.data.avatar,
          profile: {
            ...prev.profile,
            avatar: response.data.avatar
          }
        }));
        
        // Also refetch user data to ensure consistency
        try {
          const userResponse = await getMe();
          setUser(userResponse.data);
          console.log('User data refetched after avatar upload');
        } catch (refetchError) {
          console.error('Failed to refetch user data:', refetchError);
        }
        
        console.log('Avatar uploaded successfully:', response.data.avatar);
        setUploadSuccess("Avatar uploaded successfully!");
      } else {
        console.error("No avatar in response:", response.data);
        setUploadError("Failed to upload avatar - no avatar URL in response");
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setUploadError("Failed to upload avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    console.log("=== REMOVE AVATAR START ===");
    
    if (!user?.avatar && !user?.profile?.avatar) {
      setUploadError("No avatar to remove");
      return;
    }

    setUploadingAvatar(true);
    setUploadError("");
    setUploadSuccess("");
    
    try {
      console.log("Making request to /api/user/remove-avatar");
      const response = await api.delete('/api/user/remove-avatar');

      console.log("Avatar removal response:", response.data);

      if (response.data.success) {
        // Update user state to remove avatar
        setUser(prev => ({
          ...prev,
          avatar: null,
          profile: {
            ...prev.profile,
            avatar: null
          }
        }));
        
        // Refetch user data to ensure consistency
        try {
          const userResponse = await getMe();
          setUser(userResponse.data);
          console.log('User data refetched after avatar removal');
        } catch (refetchError) {
          console.error('Failed to refetch user data:', refetchError);
        }
        
        setUploadSuccess("Avatar removed successfully!");
      } else {
        setUploadError("Failed to remove avatar");
      }
    } catch (error) {
      console.error("Avatar removal error:", error);
      setUploadError("Failed to remove avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCancel = () => {
    const profile = user?.profile || {};
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      bio: profile?.bio || "",
      // Academic Background - NESTED STRUCTURE
      degree: profile?.academic?.degree || "",
      subject: profile?.academic?.subject || "",
      university: profile?.academic?.university || "",
      graduationYear: profile?.academic?.graduationYear || "",
      gpa: profile?.academic?.gpa || "",
      // Study Goal - NESTED STRUCTURE
      intendedDegree: profile?.studyGoal?.intendedDegree || "",
      fieldOfStudy: profile?.studyGoal?.fieldOfStudy || "",
      intakeYear: profile?.studyGoal?.intakeYear || "",
      preferredCountries: profile?.studyGoal?.preferredCountries || [],
      // Budget - NESTED STRUCTURE
      budgetRange: profile?.budget?.range || "",
      fundingPlan: profile?.budget?.funding || "",
      // Standardized Tests - CHECK IF NESTED OR DIRECT
      ieltsTaken: profile?.ieltsTaken || profile?.exams?.ielts?.taken || false,
      ieltsScore: profile?.ieltsScore?.overall || profile?.exams?.ielts?.score || "",
      toeflTaken: profile?.toeflTaken || profile?.exams?.toefl?.taken || false,
      toeflScore: profile?.toeflScore?.total || profile?.exams?.toefl?.score || "",
      greTaken: profile?.greTaken || profile?.exams?.gre?.taken || false,
      greScore: profile?.greScore?.total || profile?.exams?.gre?.score || "",
      gmatTaken: profile?.gmatTaken || profile?.exams?.gmat?.taken || false,
      gmatScore: profile?.gmatScore?.total || profile?.exams?.gmat?.score || "",
      // Additional Academic Info - CHECK IF NESTED OR DIRECT
      workExperience: profile?.workExperience || profile?.experience?.description || "",
      researchExperience: profile?.researchExperience || profile?.experience?.research || "",
      publications: profile?.publications || profile?.experience?.publications || "",
      certifications: profile?.certifications || profile?.experience?.certifications || "",
      // Application Readiness - CHECK IF NESTED OR DIRECT
      sopStatus: profile?.sopStatus || profile?.application?.sop || "",
      lorStatus: profile?.lorStatus || profile?.application?.lor || "",
      resumeStatus: profile?.resumeStatus || profile?.application?.resume || ""
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Profile not found
          </h3>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const calculateRealTimeStats = () => {
    const profile = user?.profile || {};
    const shortlistedUniversities = profile.shortlistedUniversities || [];
    const lockedUniversity = profile.lockedUniversity;
    const internships = profile.internships || [];
    const projects = profile.projects || [];
    
    // Use unified profile strength calculation
    const profileStrength = calculateProfileStrength(user, tasks);
    
    return {
      universitiesViewed: shortlistedUniversities.length,
      shortlisted: shortlistedUniversities.length,
      internships: internships.length,
      projects: projects.length,
      profileStrength: profileStrength,
      lockedUniversity: lockedUniversity ? 1 : 0
    };
  };

  const stats = calculateRealTimeStats();

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

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden">
                {(user?.avatar || user?.profile?.avatar) ? (
                  <img 
                    src={user?.avatar || user?.profile?.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Avatar image failed to load:', user?.avatar || user?.profile?.avatar);
                      e.target.onerror = null;
                    }}
                    onLoad={() => {
                      console.log('Avatar image loaded successfully:', user?.avatar || user?.profile?.avatar);
                    }}
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-white" />
                )}
              </div>
              <input
                type="file"
                ref={(input) => {
                  if (input) {
                    input.style.display = 'none';
                    input.addEventListener('change', handleAvatarUpload);
                  }
                }}
                accept="image/*"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => document.querySelector('input[type="file"]').click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-2 border-white/30 disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CameraIcon className="w-5 h-5 text-gray-300" />
                )}
              </motion.button>
              
              {/* Remove Avatar Button - Only show when avatar exists */}
              {(user?.avatar || user?.profile?.avatar) && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="absolute top-0 right-0 w-8 h-8 bg-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-2 border-red-400/50 disabled:opacity-50 hover:bg-red-600/80 transition-colors"
                  title="Remove Avatar"
                >
                  {uploadingAvatar ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <TrashIcon className="w-4 h-4 text-white" />
                  )}
                </motion.button>
              )}
            </div>

            {/* Upload Status Messages */}
            {uploadError && (
              <div className="mt-3 p-3 bg-red-500/20 border border-red-500 rounded-lg">
                <p className="text-red-300 text-sm">{uploadError}</p>
              </div>
            )}
            {uploadSuccess && (
              <div className="mt-3 p-3 bg-green-500/20 border border-green-500 rounded-lg">
                <p className="text-green-300 text-sm">{uploadSuccess}</p>
              </div>
            )}

            {/* User Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  {user.name || "Student"}
                </h1>
                <span className="px-3 py-1 bg-green-500/20 border border-green-500 text-green-400 rounded-full text-sm font-medium">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Verified
                </span>
              </div>
              <p className="text-gray-300 mb-4">
                {user.email || "student@example.com"}
              </p>
              
              {/* Bio Display */}
              {user?.profile?.bio && (
                <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {user.profile.bio}
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500 text-blue-400 rounded-full text-sm">Premium Member</span>
                <span className="px-3 py-1 bg-white/10 border border-white/30 text-gray-300 rounded-full text-sm">Active Since 2024</span>
                <span className="px-3 py-1 bg-white/10 border border-white/30 text-gray-300 rounded-full text-sm">AI Enthusiast</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-3">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 border border-white/30 text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <AcademicCapIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.universitiesViewed}</div>
              <div className="text-sm text-gray-300">Universities Viewed</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <DocumentTextIcon className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.shortlisted}</div>
              <div className="text-sm text-gray-300">Shortlisted</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BriefcaseIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.internships}</div>
              <div className="text-sm text-gray-300">Internships</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ChartBarIcon className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.profileStrength}%</div>
              <div className="text-sm text-gray-300">Profile Strength</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <LockClosedIcon className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.lockedUniversity}</div>
              <div className="text-sm text-gray-300">University Locked</div>
            </div>
          </motion.div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!editing}
                    className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!editing}
                    className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!editing}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </motion.div>

          {/* Academic Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-bold text-white mb-6">Academic Preferences</h2>
            <div className="space-y-4">
                            
              {/* Academic Background Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Academic Background</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Current Degree Level</label>
                    <select
                      value={formData.degree}
                      onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="" className="text-gray-900">Select degree</option>
                      <option value="high-school" className="text-gray-900">High School</option>
                      <option value="bachelors" className="text-gray-900">Bachelor's</option>
                      <option value="masters" className="text-gray-900">Master's</option>
                      <option value="phd" className="text-gray-900">PhD</option>
                      <option value="other" className="text-gray-900">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Major/Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Computer Science, Mechanical Engineering"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current/Previous University</label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                    disabled={!editing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Massachusetts Institute of Technology"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">GPA/Grade</label>
                    <input
                      type="text"
                      value={formData.gpa}
                      onChange={(e) => setFormData(prev => ({ ...prev, gpa: e.target.value }))}
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 3.8/4.0 or 85%"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Graduation Year</label>
                    <input
                      type="number"
                      value={formData.graduationYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 2024"
                      min="2020"
                      max="2030"
                    />
                  </div>
                </div>
              </div>

              {/* Study Goal Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Study Goals</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Intended Degree</label>
                  <select
                    value={formData.intendedDegree}
                    onChange={(e) => setFormData(prev => ({ ...prev, intendedDegree: e.target.value }))}
                    disabled={!editing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" className="text-gray-900">Select degree</option>
                    <option value="bachelors" className="text-gray-900">Bachelor's</option>
                    <option value="masters" className="text-gray-900">Master's</option>
                    <option value="phd" className="text-gray-900">PhD</option>
                    <option value="diploma" className="text-gray-900">Diploma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Field of Study</label>
                  <input
                    type="text"
                    value={formData.fieldOfStudy}
                    onChange={(e) => setFormData(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                    disabled={!editing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Data Science, Engineering"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Intake Year</label>
                  <select
                    value={formData.intakeYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, intakeYear: e.target.value }))}
                    disabled={!editing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" className="text-gray-900">Select year</option>
                    <option value="2024" className="text-gray-900">2024</option>
                    <option value="2025" className="text-gray-900">2025</option>
                    <option value="2026" className="text-gray-900">2026</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Countries</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["USA", "UK", "Canada", "Australia", "Germany", "Singapore"].map((country) => (
                      <label key={country} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferredCountries.includes(country)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, preferredCountries: [...prev.preferredCountries, country] }));
                            } else {
                              setFormData(prev => ({ ...prev, preferredCountries: prev.preferredCountries.filter(c => c !== country) }));
                            }
                          }}
                          disabled={!editing}
                          className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="text-white text-sm">{country}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Budget Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Budget & Funding</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Budget Range</label>
                  <input
                    type="text"
                    value={formData.budgetRange}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetRange: e.target.value }))}
                    disabled={!editing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., $20,000 - $30,000 per year"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Funding Plan</label>
                  <textarea
                    value={formData.fundingPlan}
                    onChange={(e) => setFormData(prev => ({ ...prev, fundingPlan: e.target.value }))}
                    disabled={!editing}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your funding sources (scholarships, loans, personal funds, etc.)"
                  />
                </div>
              </div>

              {/* Standardized Tests Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Standardized Tests</h3>
                
                <div className="space-y-6">
                  {/* IELTS */}
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        checked={formData.ieltsTaken}
                        onChange={(e) => setFormData(prev => ({ ...prev, ieltsTaken: e.target.checked }))}
                        disabled={!editing}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <label className="text-white font-medium">IELTS Taken</label>
                    </div>
                    
                    {formData.ieltsTaken && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Overall Score</label>
                          <input
                            type="text"
                            value={formData.ieltsScore}
                            onChange={(e) => setFormData(prev => ({ ...prev, ieltsScore: e.target.value }))}
                            disabled={!editing}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 7.5"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TOEFL */}
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        checked={formData.toeflTaken}
                        onChange={(e) => setFormData(prev => ({ ...prev, toeflTaken: e.target.checked }))}
                        disabled={!editing}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <label className="text-white font-medium">TOEFL Taken</label>
                    </div>
                    
                    {formData.toeflTaken && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Total Score</label>
                          <input
                            type="text"
                            value={formData.toeflScore}
                            onChange={(e) => setFormData(prev => ({ ...prev, toeflScore: e.target.value }))}
                            disabled={!editing}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 100"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* GRE */}
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        checked={formData.greTaken}
                        onChange={(e) => setFormData(prev => ({ ...prev, greTaken: e.target.checked }))}
                        disabled={!editing}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <label className="text-white font-medium">GRE Taken</label>
                    </div>
                    
                    {formData.greTaken && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Total Score</label>
                          <input
                            type="text"
                            value={formData.greScore}
                            onChange={(e) => setFormData(prev => ({ ...prev, greScore: e.target.value }))}
                            disabled={!editing}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 320"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* GMAT */}
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        checked={formData.gmatTaken}
                        onChange={(e) => setFormData(prev => ({ ...prev, gmatTaken: e.target.checked }))}
                        disabled={!editing}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <label className="text-white font-medium">GMAT Taken</label>
                    </div>
                    
                    {formData.gmatTaken && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Total Score</label>
                          <input
                            type="text"
                            value={formData.gmatScore}
                            onChange={(e) => setFormData(prev => ({ ...prev, gmatScore: e.target.value }))}
                            disabled={!editing}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 700"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Academic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Additional Academic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Work Experience</label>
                  <textarea
                    value={formData.workExperience}
                    onChange={(e) => setFormData(prev => ({ ...prev, workExperience: e.target.value }))}
                    disabled={!editing}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your relevant work experience"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Research Experience</label>
                  <textarea
                    value={formData.researchExperience}
                    onChange={(e) => setFormData(prev => ({ ...prev, researchExperience: e.target.value }))}
                    disabled={!editing}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your research experience and publications"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Publications</label>
                  <textarea
                    value={formData.publications}
                    onChange={(e) => setFormData(prev => ({ ...prev, publications: e.target.value }))}
                    disabled={!editing}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="List your publications (if any)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Certifications</label>
                  <textarea
                    value={formData.certifications}
                    onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                    disabled={!editing}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="List your relevant certifications"
                  />
                </div>
              </div>

              {/* Application Readiness */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Application Readiness</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">SOP Status</label>
                    <select
                      value={formData.sopStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, sopStatus: e.target.value }))}
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="" className="text-gray-900">Select status</option>
                      <option value="not-started" className="text-gray-900">Not Started</option>
                      <option value="in-progress" className="text-gray-900">In Progress</option>
                      <option value="completed" className="text-gray-900">Completed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">LOR Status</label>
                    <select
                      value={formData.lorStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, lorStatus: e.target.value }))}
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="" className="text-gray-900">Select status</option>
                      <option value="not-started" className="text-gray-900">Not Started</option>
                      <option value="in-progress" className="text-gray-900">In Progress</option>
                      <option value="completed" className="text-gray-900">Completed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Resume Status</label>
                    <select
                      value={formData.resumeStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, resumeStatus: e.target.value }))}
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="" className="text-gray-900">Select status</option>
                      <option value="not-started" className="text-gray-900">Not Started</option>
                      <option value="in-progress" className="text-gray-900">In Progress</option>
                      <option value="completed" className="text-gray-900">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {generateRealTimeActivities().map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activity.color === 'blue' ? 'bg-blue-500/20' :
                  activity.color === 'green' ? 'bg-green-500/20' :
                  activity.color === 'purple' ? 'bg-purple-500/20' :
                  activity.color === 'indigo' ? 'bg-indigo-500/20' :
                  activity.color === 'orange' ? 'bg-orange-500/20' :
                  activity.color === 'teal' ? 'bg-teal-500/20' :
                  'bg-gray-500/20'
                }`}>
                  <activity.icon className={`w-5 h-5 ${
                    activity.color === 'blue' ? 'text-blue-400' :
                    activity.color === 'green' ? 'text-green-400' :
                    activity.color === 'purple' ? 'text-purple-400' :
                    activity.color === 'indigo' ? 'text-indigo-400' :
                    activity.color === 'orange' ? 'text-orange-400' :
                    activity.color === 'teal' ? 'text-teal-400' :
                    'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-white">{activity.text}</p>
                  <p className="text-sm text-gray-400 flex items-center mt-1">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Generate real-time activities based on user data
  function generateRealTimeActivities() {
    const activities = [];
    const now = new Date();
    const profile = user?.profile || {};
    
    if (user?.onboardingCompleted) {
      activities.push({
        icon: CheckCircleIcon,
        text: "Completed onboarding process",
        time: "Just now",
        color: "green"
      });
    }
    
    if (profile.shortlistedUniversities?.length > 0) {
      activities.push({
        icon: AcademicCapIcon,
        text: `Shortlisted ${profile.shortlistedUniversities.length} universities`,
        time: "Recently",
        color: "blue"
      });
    }
    
    if (profile.lockedUniversity?.universityId) {
      activities.push({
        icon: LockClosedIcon,
        text: "Locked university for application",
        time: "Recently",
        color: "purple"
      });
    }
    
    if (profile.internships?.length > 0) {
      activities.push({
        icon: BriefcaseIcon,
        text: `Added ${profile.internships.length} internship${profile.internships.length > 1 ? 's' : ''}`,
        time: "Today",
        color: "indigo"
      });
    }
    
    if (profile.projects?.length > 0) {
      activities.push({
        icon: DocumentTextIcon,
        text: `Added ${profile.projects.length} project${profile.projects.length > 1 ? 's' : ''}`,
        time: "Today",
        color: "orange"
      });
    }
    
    if (profile.intendedDegree && profile.fieldOfStudy) {
      activities.push({
        icon: GlobeAltIcon,
        text: `Set study goal: ${profile.intendedDegree} in ${profile.fieldOfStudy}`,
        time: "Today",
        color: "teal"
      });
    }
    
    if (profile.budgetRange) {
      activities.push({
        icon: ChartBarIcon,
        text: `Set budget range: ${profile.budgetRange}`,
        time: "Today",
        color: "yellow"
      });
    }
    
    if (profile.subject) {
      activities.push({
        icon: AcademicCapIcon,
        text: `Set major: ${profile.subject}`,
        time: "Today",
        color: "cyan"
      });
    }
    
    // Add account creation activity
    if (user?.createdAt) {
      const createdDate = new Date(user.createdAt);
      const timeDiff = now - createdDate;
      const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      activities.push({
        icon: UserGroupIcon,
        text: "Account created",
        time: daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`,
        color: "gray"
      });
    }
    
    return activities.slice(0, 6); // Limit to 6 most recent activities
  }
}
