import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMe, getUniversityById, getUniversities } from "../helpers/endpoints";
import applicationEndpoints from "../helpers/application.endpoints.js";
import {
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";

export default function Application() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const universityId = searchParams.get('university');
  const [user, setUser] = useState(null);
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [applications, setApplications] = useState([]);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [formData, setFormData] = useState({
    university: '',
    degree: '',
    gpa: ''
  });
  const [documentForm, setDocumentForm] = useState({
    documentType: '',
    file: null,
    fileName: ''
  });
  const [universities, setUniversities] = useState([]);

  const createApplicationForUniversity = async (universityData = null) => {
    try {
      const requestData = {
        universityId: universityData?._id || null,
        program: universityData?.program || 'General Program',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
        status: 'draft'
      };
      
      console.log('Sending application request:', requestData);
      
      const response = await applicationEndpoints.createApplication(requestData);
      
      const newApplication = response.data.data;
      console.log('Application created in MongoDB:', newApplication);
      
      // Refresh the applications list
      const applicationsResponse = await applicationEndpoints.getApplications();
      setApplications(applicationsResponse.data.data || []);
      
      const message = universityData 
        ? `Application created for ${universityData.name}!`
        : 'New application created successfully!';
      setMessage(message);
      setMessageType('success');
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error('Failed to create application:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setMessage('Failed to create application. Please try again.');
      setMessageType('error');
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const fetchUniversities = async () => {
    try {
      console.log('Fetching universities...');
      const response = await getUniversities();
      console.log('Universities API response:', response);
      console.log('Universities data:', response.data);
      
      // The API returns { total: number, universities: array }
      const universitiesData = response.data?.universities || [];
      console.log('Setting universities:', universitiesData);
      setUniversities(universitiesData);
    } catch (error) {
      console.error('Failed to fetch universities:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.university || !formData.degree || !formData.gpa) {
      setMessage('Please fill all fields');
      setMessageType('error');
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const requestData = {
        universityId: formData.university,
        program: formData.degree,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'draft',
        gpa: formData.gpa
      };
      
      console.log('Creating application with form data:', requestData);
      
      const response = await applicationEndpoints.createApplication(requestData);
      
      const newApplication = response.data.data;
      console.log('Application created in MongoDB:', newApplication);
      
      // Refresh the applications list
      const applicationsResponse = await applicationEndpoints.getApplications();
      setApplications(applicationsResponse.data.data || []);
      
      setMessage('Application created successfully!');
      setMessageType('success');
      setShowApplicationForm(false);
      setFormData({ university: '', degree: '', gpa: '' });
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error('Failed to create application:', error);
      setMessage('Failed to create application. Please try again.');
      setMessageType('error');
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleUploadDocument = async (applicationId) => {
    setSelectedApplicationId(applicationId);
    setShowDocumentForm(true);
  };

  const handleViewApplication = async (applicationId) => {
    try {
      const response = await applicationEndpoints.getApplicationById(applicationId);
      setSelectedApplication(response.data.data);
      setShowApplicationDetails(true);
    } catch (error) {
      console.error('Error fetching application details:', error);
      setMessage('Failed to load application details');
      setMessageType('error');
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDocumentFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!documentForm.documentType || !documentForm.file) {
      setMessage('Please select document type and upload a file');
      setMessageType('error');
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('document', documentForm.file);
      formData.append('name', documentForm.fileName || documentForm.file.name);
      formData.append('type', documentForm.documentType);
      
      console.log('Submitting document form:', {
        applicationId: selectedApplicationId,
        documentType: documentForm.documentType,
        fileName: documentForm.fileName,
        fileSize: documentForm.file.size
      });
      
      const response = await applicationEndpoints.uploadDocument(selectedApplicationId, formData);
      console.log('Document uploaded successfully:', response.data);
      
      // Refresh applications to show the new document
      const applicationsResponse = await applicationEndpoints.getApplications();
      setApplications(applicationsResponse.data.data || []);
      
      setMessage('Document uploaded successfully to Cloudinary!');
      setMessageType('success');
      setShowDocumentForm(false);
      setDocumentForm({ documentType: '', file: null, fileName: '' });
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error('Error uploading document:', error);
      console.error('Error response:', error.response?.data);
      setMessage('Failed to upload document. Please try again.');
      setMessageType('error');
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleSubmitApplication = async () => {
    if (!universityId) {
      setMessage('Please select a university first');
      setMessageType('error');
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setSubmitting(true);
    try {
      // First create the application in MongoDB
      const applicationResponse = await applicationEndpoints.createApplication({
        university: universityId,
        status: 'draft'
      });

      const applicationId = applicationResponse.data.data._id;
      console.log('Application created in MongoDB:', applicationId);

      // Then submit the application
      await applicationEndpoints.submitApplication(applicationId);
      console.log('Application submitted to MongoDB');

      setMessage('Application submitted successfully to database!');
      setMessageType('success');
      setTimeout(() => {
        setMessage("");
        navigate('/applications');
      }, 2000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setMessage('Failed to submit application. Please try again.');
      setMessageType('error');
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userData = await getMe();
        setUser(userData);

        // Fetch applications
        const applicationsResponse = await applicationEndpoints.getApplications();
        setApplications(applicationsResponse.data.data || []);

        // Fetch universities for dropdown
        await fetchUniversities();

        // Fetch university data if universityId is provided
        if (universityId) {
          const universityResponse = await fetch(`http://localhost:8000/api/universities/${universityId}`);
          const universityData = await universityResponse.json();
          setUniversity(universityData.data);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [universityId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-300 mb-6">Please log in to view your applications</p>
          <button
            onClick={() => navigate("/auth/login")}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
          >
            Log In
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
              : messageType === 'info'
              ? 'bg-blue-500/20 border-blue-500 text-blue-300'
              : 'bg-red-500/20 border-red-500 text-red-300'
          }`}>
            <p className="text-sm font-medium">{message}</p>
          </div>
        </div>
      )}
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">Applications</h1>
                <span className="text-gray-400">Manage your university applications</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => setShowApplicationForm(true)}
                >
                  <PlusIcon className="w-5 h-5" />
                  New Application
                </button>
                
                {university && (
                  <button
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    onClick={() => createApplicationForUniversity(university)}
                  >
                    <AcademicCapIcon className="w-5 h-5" />
                  Apply to {university.name}
                </button>
                )}
                
                <button
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => {
                    if (applications.length === 0) {
                      setMessage('Please create an application first before uploading documents');
                      setMessageType('error');
                      setTimeout(() => setMessage(""), 3000);
                      return;
                    }
                    // Upload to the most recent application
                    const latestApplication = applications[0];
                    handleUploadDocument(latestApplication._id);
                  }}
                >
                  <ArrowUpTrayIcon className="w-5 h-5" />
                  Upload Document
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* University Info Section (if university is selected) */}
          {university && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <AcademicCapIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Applying to: {university.name}</h2>
                    <div className="flex items-center gap-4 text-indigo-200">
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{university.location || university.country}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        <span>${typeof university.tuitionFeePerYear === 'number' 
                          ? (university.tuitionFeePerYear / 1000).toFixed(0) + 'k/year'
                          : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/university/${university._id}`)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors"
                >
                  View University Details
                </button>
              </div>
            </motion.div>
          )}

          {/* Applications Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((application) => (
                  <motion.div
                    key={application._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <DocumentTextIcon className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {application.university?.name || 'Application'}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {application.program || 'General Program'}
                          </p>
                          {application.gpa && (
                            <p className="text-gray-400 text-sm">
                              GPA: {application.gpa}
                            </p>
                          )}
                          <p className="text-gray-400 text-sm">
                            {application.university?.location || application.university?.country || 'Location'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        application.status === 'SUBMITTED' 
                          ? 'text-green-400 bg-green-500/20 border-green-500/30'
                          : application.status === 'IN_PROGRESS'
                          ? 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
                          : 'text-gray-400 bg-gray-500/20 border-gray-500/30'
                      }`}>
                        {application.status || 'Draft'}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{application.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500" 
                          style={{ width: `${application.progress || 0}%` }} 
                        />
                      </div>
                    </div>

                    {/* Documents Count */}
                    {application.documents && application.documents.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-400">
                          Documents: {application.documents.length} uploaded
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => handleViewApplication(application._id)}
                        className="w-full sm:flex-1 py-3 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <EyeIcon className="w-4 h-4 inline mr-1" />
                        View
                      </button>
                      <button 
                        onClick={() => handleUploadDocument(application._id)}
                        className="w-full sm:flex-1 py-3 px-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <ArrowUpTrayIcon className="w-4 h-4" />
                        Upload Doc
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this application?')) {
                            try {
                              await applicationEndpoints.deleteApplication(application._id);
                              setMessage('Application deleted successfully!');
                              setMessageType('success');
                              // Refresh the applications list
                              const response = await applicationEndpoints.getApplications();
                              setApplications(response.data.data || []);
                              setTimeout(() => {
                                setMessage("");
                              }, 2000);
                            } catch (error) {
                              console.error('Failed to delete application:', error);
                              setMessage('Failed to delete application. Please try again.');
                              setMessageType('error');
                              setTimeout(() => setMessage(""), 3000);
                            }
                          }
                        }}
                        className="w-full sm:flex-1 py-3 px-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 text-center"
              >
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Applications Yet</h3>
                <p className="text-gray-400 mb-6">
                  Create your first application to get started with your study abroad journey.
                </p>
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                >
                  Create Your First Application
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Create Application</h2>
                  <p className="text-indigo-100 text-sm mt-1">Start your study abroad journey</p>
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <AcademicCapIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* University Dropdown */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">
                    <span className="flex items-center gap-2">
                      <AcademicCapIcon className="w-4 h-4" />
                      Select University
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.university}
                      onChange={(e) => setFormData({...formData, university: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none bg-white text-gray-900 font-medium"
                      required
                    >
                      <option value="">Choose your university</option>
                      {universities.map((uni) => (
                        <option key={uni._id} value={uni._id}>
                          {uni.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {universities.length === 0 && (
                    <p className="text-amber-500 text-sm mt-2 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      Loading universities...
                    </p>
                  )}
                </div>

                {/* Degree Program Input */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">
                    <span className="flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4" />
                      Degree Program
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({...formData, degree: e.target.value})}
                    placeholder="e.g., Computer Science, Business Administration"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900"
                    required
                  />
                </div>

                {/* GPA Input */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Current GPA
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.gpa}
                      onChange={(e) => setFormData({...formData, gpa: e.target.value})}
                      placeholder="e.g., 3.5"
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <span className="text-gray-400 text-sm font-medium">/4.0</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Enter your GPA on a 4.0 scale</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <PlusIcon className="w-5 h-5" />
                      Create Application
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplicationForm(false);
                      setFormData({ university: '', degree: '', gpa: '' });
                    }}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
              <p className="text-center text-sm text-gray-500">
                🎓 Your journey to international education starts here
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Document Upload Form Modal */}
      {showDocumentForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-8 py-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Upload Document</h2>
                  <p className="text-green-100 text-sm mt-1">Add supporting documents to your application</p>
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <ArrowUpTrayIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <form onSubmit={handleDocumentFormSubmit} className="space-y-6">
                {/* Document Type Dropdown */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-600 transition-colors">
                    <span className="flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4" />
                      Document Type
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={documentForm.documentType}
                      onChange={(e) => setDocumentForm({...documentForm, documentType: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none bg-white text-gray-900 font-medium"
                      required
                    >
                      <option value="">Select document type</option>
                      <option value="Transcript">Academic Transcript</option>
                      <option value="Resume">Resume/CV</option>
                      <option value="Essay">Personal Essay</option>
                      <option value="Recommendation">Letter of Recommendation</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Other">Other Document</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* File Upload Area */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-600 transition-colors">
                    <span className="flex items-center gap-2">
                      <ArrowUpTrayIcon className="w-4 h-4" />
                      Upload Document
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setDocumentForm({
                            ...documentForm,
                            file: file,
                            fileName: file.name
                          });
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      required
                    />
                    {documentForm.file && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 font-medium">
                          📄 {documentForm.fileName}
                        </p>
                        <p className="text-xs text-green-600">
                          Size: {(documentForm.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <ArrowUpTrayIcon className="w-5 h-5" />
                      Upload Document
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDocumentForm(false);
                      setDocumentForm({ documentType: '', file: null, fileName: '' });
                    }}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
              <p className="text-center text-sm text-gray-500">
                📋 Ensure your documents are clear and legible
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Application Details Modal */}
      {showApplicationDetails && selectedApplication && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-t-2xl sticky top-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Application Details</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {selectedApplication.university?.name || 'Application'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="space-y-6">
                {/* University Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">University Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">University</p>
                      <p className="font-medium text-gray-900">
                        {selectedApplication.university?.name || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Program</p>
                      <p className="font-medium text-gray-900">
                        {selectedApplication.program || 'Not specified'}
                      </p>
                    </div>
                    {selectedApplication.gpa && (
                      <div>
                        <p className="text-sm text-gray-500">GPA</p>
                        <p className="font-medium text-gray-900">{selectedApplication.gpa}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        selectedApplication.status === 'SUBMITTED' 
                          ? 'text-green-400 bg-green-500/20 border-green-500/30'
                          : selectedApplication.status === 'IN_PROGRESS'
                          ? 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
                          : 'text-gray-400 bg-gray-500/20 border-gray-500/30'
                      }`}>
                        {selectedApplication.status?.replace('_', ' ') || 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                {selectedApplication.progress !== undefined && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full bg-blue-500 transition-all duration-300" 
                        style={{ width: `${selectedApplication.progress}%` }} 
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{selectedApplication.progress}% Complete</p>
                  </div>
                )}

                {/* Documents */}
                {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents ({selectedApplication.documents.length})</h3>
                    <div className="space-y-3">
                      {selectedApplication.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{doc.name}</p>
                              <p className="text-sm text-gray-500">{doc.type} • {doc.size}</p>
                            </div>
                          </div>
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deadlines */}
                {selectedApplication.deadline && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Dates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Application Deadline</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedApplication.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedApplication.submittedDate && (
                        <div>
                          <p className="text-sm text-gray-500">Submitted Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(selectedApplication.submittedDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setShowApplicationDetails(false);
                    setSelectedApplication(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowApplicationDetails(false);
                    handleUploadDocument(selectedApplication._id);
                  }}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  Upload Document
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
