import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import { getMe, getSettings, updateProfileSettings, updateNotificationSettings, updatePrivacySettings, logoutAllDevices, deleteAccount, uploadAvatar, removeAvatar } from "../helpers/endpoints";
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  UserCircleIcon,
  DocumentTextIcon,
  MoonIcon,
  SunIcon,
  ArrowLeftOnRectangleIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const fileInputRef = useRef(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    bio: ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    updates: true
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showEmail: false,
    showProgress: true
  });
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchSettings();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await getMe();
      const userData = response.data || response;
      setUser(userData);
      setProfileForm({
        name: userData.name || '',
        email: userData.email || '',
        bio: userData.profile?.bio || ''
      });
    } catch (err) {
      console.error("Failed to load user data:", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await getSettings();
      const settings = response.data || response;
      setNotifications(settings.notifications || {
        email: true,
        push: false,
        sms: false,
        updates: true
      });
      setPrivacy(settings.privacy || {
        profileVisibility: "public",
        showEmail: false,
        showProgress: true
      });
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage("Please select an image file");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage("File size must be less than 5MB");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setUploadingAvatar(true);
    try {
      const response = await uploadAvatar(file);
      await fetchUserData(); // Refresh user data
      setMessage("Avatar updated successfully!");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      setMessage("Failed to upload avatar. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar();
      await fetchUserData(); // Refresh user data
      setMessage("Avatar removed successfully!");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to remove avatar:", err);
      setMessage("Failed to remove avatar. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      console.log("Saving profile to MongoDB:", profileForm);
      await updateProfileSettings(profileForm);
      await fetchUserData(); // Refresh user data from MongoDB
      console.log("Profile saved successfully to MongoDB");
      setMessage("Profile updated successfully in database!");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setMessage("Failed to update profile. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      console.log("Saving notifications to MongoDB:", notifications);
      await updateNotificationSettings(notifications);
      console.log("Notifications saved successfully to MongoDB");
      setMessage("Notification settings updated successfully in database!");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to update notifications:", err);
      setMessage("Failed to update notification settings. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    setSaving(true);
    try {
      console.log("Saving privacy settings to MongoDB:", privacy);
      await updatePrivacySettings(privacy);
      console.log("Privacy settings saved successfully to MongoDB");
      setMessage("Privacy settings updated successfully in database!");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to update privacy:", err);
      setMessage("Failed to update privacy settings. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (window.confirm("Are you sure you want to logout from all devices?")) {
      try {
        console.log("Logging out from all devices in MongoDB");
        await logoutAllDevices();
        console.log("Logged out from all devices successfully");
        setMessage("Logged out from all devices successfully!");
        setMessageType("success");
        setTimeout(() => {
          setMessage("");
          handleLogout();
        }, 2000);
      } catch (err) {
        console.error("Failed to logout from all devices:", err);
        setMessage("Failed to logout from all devices. Please try again.");
        setMessageType("error");
        setTimeout(() => setMessage(""), 3000);
      }
    }
  };

  const handleDeleteAccount = async () => {
    const password = prompt("Please enter your password to confirm account deletion:");
    if (!password) return;

    if (window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
      try {
        console.log("Deleting account from MongoDB");
        await deleteAccount(password);
        console.log("Account deleted successfully");
        setMessage("Account deleted successfully!");
        setMessageType("success");
        setTimeout(() => {
          setMessage("");
          handleLogout();
        }, 2000);
      } catch (err) {
        console.error("Failed to delete account:", err);
        setMessage("Failed to delete account. Please check your password and try again.");
        setMessageType("error");
        setTimeout(() => setMessage(""), 3000);
      }
    }
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: UserCircleIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "privacy", name: "Privacy", icon: ShieldCheckIcon },
    { id: "danger", name: "Danger Zone", icon: ExclamationTriangleIcon }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-64"
          >
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-600"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Profile Settings
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Profile" 
                          className="h-20 w-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-2xl font-medium">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {user?.name || 'User'}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {user?.email || 'user@example.com'}
                      </p>
                      <div className="mt-2 flex space-x-2">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploadingAvatar ? 'Uploading...' : 'Change avatar'}
                        </button>
                        {user?.avatar && (
                          <button 
                            onClick={handleRemoveAvatar}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Notification Preferences
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive updates and alerts via email
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.email ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.email ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Push Notifications
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive browser push notifications
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.push ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.push ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        SMS Notifications
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive text message alerts
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.sms ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.sms ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Product Updates
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive updates about new features
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, updates: !notifications.updates })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.updates ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.updates ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === "privacy" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Privacy Settings
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Profile Visibility
                    </label>
                    <select
                      value={privacy.profileVisibility}
                      onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="friends">Friends Only</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Show Email Address
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Display your email on your public profile
                        </p>
                      </div>
                      <button
                        onClick={() => setPrivacy({ ...privacy, showEmail: !privacy.showEmail })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          privacy.showEmail ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            privacy.showEmail ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Show Progress
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Display your application progress publicly
                        </p>
                      </div>
                      <button
                        onClick={() => setPrivacy({ ...privacy, showProgress: !privacy.showProgress })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          privacy.showProgress ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            privacy.showProgress ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSavePrivacy}
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            {activeTab === "danger" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-6">
                  Danger Zone
                </h2>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-red-500 pl-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Logout from all devices
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      This will log you out from all active sessions on other devices.
                    </p>
                    <button
                      onClick={handleLogoutAllDevices}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Logout Everywhere
                    </button>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Delete Account
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
