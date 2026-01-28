import api from "./api";

// auth
export const signup = (data) => api.post("/api/auth/signup", data);
export const login = (data) => api.post("/api/auth/login", data);
export const requestSignupOTP = (data) => api.post("/api/auth/request-otp", data);
export const verifySignupOTP = (data) => api.post("/api/auth/verify-otp", data);
export const forgotPassword = (data) => api.post("/api/auth/forgot-password", data);
export const verifyResetOTP = (data) => api.post("/api/auth/verify-reset-otp", data);
export const resetPassword = (data) => api.post("/api/auth/reset-password", data);

// user
export const getMe = () => api.get("/api/user/me");
export const onboarding = (data) => api.post("/api/user/onboarding", data);
export const updateUser = (data) => api.put("/api/user/me", data);
export const logout = () => api.post("/api/auth/logout");

// Check AI counselling status
export const checkAiCounsellingStatus = () => api.get("/api/user/ai-counselling-status");

// ai
export const askCounsellor = (message) => api.post("/api/counsellor", { message });

// universities
export const getUniversities = () => api.get("/api/universities");
export const getUniversityById = (id) => api.get(`/api/universities/${id}`);
export const shortlistUniversity = (universityId, universityName) => {
  const payload = universityId ? { universityId } : { universityName };
  return api.post("/api/universities/shortlist", payload);
};
export const unshortlistUniversity = (universityId) => api.delete(`/api/universities/shortlist/${universityId}`);
export const lockUniversity = (universityId, universityName) => {
  const payload = universityId ? { universityId } : { universityName };
  return api.post("/api/universities/lock", payload);
};
export const unlockUniversity = () => api.post("/api/universities/unlock");

// tasks
export const getTasks = () => api.get("/api/tasks");
export const createTask = (data) => api.post("/api/tasks", data);
export const updateTaskStatus = (taskId, status) => api.put(`/api/tasks/${taskId}/status`, { status });

// applications
export const getApplications = () => api.get("/api/applications");
export const getApplicationById = (id) => api.get(`/api/applications/${id}`);

// settings
export const getSettings = () => api.get("/api/settings");
export const updateProfileSettings = (data) => api.put("/api/settings/profile", data);
export const updateNotificationSettings = (data) => api.put("/api/settings/notifications", data);
export const updatePrivacySettings = (data) => api.put("/api/settings/privacy", data);
export const updateAppearanceSettings = (data) => api.put("/api/settings/appearance", data);
export const logoutAllDevices = () => api.post("/api/settings/logout-all");
export const deleteAccount = (password) => api.delete("/api/settings/account", { data: { password } });