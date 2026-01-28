import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getMe } from "../helpers/endpoints";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  PencilIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  SparklesIcon,
  HomeIcon,
  BookOpenIcon,
  GlobeAltIcon,
  CalendarIcon,
  BellIcon,
  FireIcon,
  StarIcon
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    fetchUserData();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await getMe();
      const userData = response.data || response;
      setUser(userData);
      setEditForm({
        name: userData.name || '',
        email: userData.email || ''
      });
    } catch (err) {
      console.error("Failed to load user data:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const handleEditProfile = async () => {
    setLoading(true);
    try {
      // TODO: Add API call to update user profile
      console.log("Updating profile:", editForm);
      await fetchUserData(); // Refresh user data
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Universities", href: "/universities", icon: GlobeAltIcon },
    { name: "Tasks", href: "/tasks", icon: DocumentTextIcon },
    { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
    { name: "Applications", href: "/applications", icon: DocumentTextIcon },
    { name: "AI Counsellor", href: "/ai-counsellor", icon: SparklesIcon },
    { name: "Profile", href: "/profile", icon: UserCircleIcon },
  ];

  return (
    <>
      <nav className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src="/logo.png" 
                  alt="AI Counsellor Logo" 
                  className="h-7 w-7 sm:h-8 sm:w-8 object-contain rounded-lg"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 14l9-5-9-5-9 5 9 5z'/%3E%3C/svg%3E";
                  }}
                />
                <span className="ml-1 sm:ml-2 text-lg sm:text-xl font-bold text-white hidden sm:block">
                  AI Counsellor
                </span>
                <span className="ml-1 text-lg font-bold text-white sm:hidden">
                  AI
                </span>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:ml-6 lg:ml-8 md:flex md:space-x-3 lg:space-x-5">
                {navigation.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ 
                        scale: 1.05,
                        y: -2
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center px-2 py-2 text-xs lg:text-sm font-medium text-gray-300 hover:text-indigo-400 transition-colors whitespace-nowrap relative group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-indigo-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                      <motion.div 
                        className="relative z-10"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="h-4 w-4 mr-1 lg:mr-2" />
                      </motion.div>
                      <span className="hidden lg:inline relative z-10">{item.name}</span>
                      <span className="lg:hidden relative z-10">{item.name.slice(0, 3)}</span>
                      {item.name === 'Tasks' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1.2 }}
                          className="absolute -top-1 -right-1 z-20"
                        >
                          <FireIcon className="w-3 h-3 text-orange-400" />
                        </motion.div>
                      )}
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {(user?.avatar && user?.avatar !== '/logo.png' && user?.avatar !== 'logo.png') || (user?.profile?.avatar && user?.profile?.avatar !== '/logo.png' && user?.profile?.avatar !== 'logo.png') ? (
                      <img 
                        src={user?.avatar || user?.profile?.avatar} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Avatar failed to load in navbar:', e);
                          // Fallback to profile icon if image fails
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14"></path></svg>';
                        }}
                      />
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14" />
                      </svg>
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-300 truncate max-w-24">
                    {user?.name || 'User'}
                  </span>
                  <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden"
                    >
                      {/* User Info */}
                      <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                            {(user?.avatar && user?.avatar !== '/logo.png' && user?.avatar !== 'logo.png') || (user?.profile?.avatar && user?.profile?.avatar !== '/logo.png' && user?.profile?.avatar !== 'logo.png') ? (
                              <img 
                                src={user?.avatar || user?.profile?.avatar} 
                                alt="Profile Avatar" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error('Avatar failed to load in navbar dropdown:', e);
                                  // Fallback to profile icon if image fails
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14"></path></svg>';
                                }}
                              />
                            ) : (
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {user?.name || 'User'}
                            </p>
                            <p className="text-sm text-gray-400">
                              {user?.email || 'user@example.com'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setIsEditModalOpen(true);
                            setIsProfileOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4 mr-3" />
                          Edit Profile
                        </button>
                        
                        <a
                          href="/profile"
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                          <UserCircleIcon className="h-4 w-4 mr-3" />
                          View Profile
                        </a>
                        
                        <a
                          href="/settings"
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                          <Cog6ToothIcon className="h-4 w-4 mr-3" />
                          Settings
                        </a>
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex-shrink-0 ml-2">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {isOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-700"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl border border-gray-700"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">
                      Edit Profile
                    </h2>
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-700 text-white"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-700 text-white"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={handleEditProfile}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setIsEditModalOpen(false)}
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
