// Unified profile strength calculation utility

export const calculateProfileStrength = (userData, tasks = []) => {
  if (!userData) return 0;
  
  // If backend provided profileStrength, use that
  if (userData.profileStrength !== undefined) {
    return userData.profileStrength;
  }
  
  const profile = userData.profile || {};
  let strength = 0;
  let total = 10; // Increased from 8 to 10
  
  // Check onboarding completion (10%)
  if (userData.onboardingCompleted) strength += 1;
  
  // Check academic information (10% each)
  if (profile.academic?.major) strength += 1;
  if (profile.academic?.gpa) strength += 1;
  
  // Check study goals (10% each)
  if (profile.studyGoal?.degree) strength += 1;
  if (profile.studyGoal?.field) strength += 1;
  
  // Check budget (10%)
  if (profile.budget?.range) strength += 1;
  
  // Check exams (5% each)
  if (profile.exams?.ielts?.score) strength += 1;
  if (profile.exams?.gre?.score) strength += 1;
  
  // NEW: Check documents uploaded (10%)
  if (userData.avatar || profile.avatar) strength += 1;
  
  // NEW: Check completed tasks (10%)
  const completedTasks = tasks.filter(task => task.status === "COMPLETED").length;
  if (completedTasks >= 3) strength += 1; // At least 3 completed tasks
  
  // Calculate percentage
  const percentage = Math.round((strength / total) * 100);
  
  // If profile has completionPercentage from backend, use that
  if (profile.completionPercentage) {
    return profile.completionPercentage;
  }
  
  return percentage;
};

export const getProfileStrengthColor = (percentage) => {
  if (percentage >= 80) return "text-green-400";
  if (percentage >= 60) return "text-yellow-400";
  if (percentage >= 40) return "text-orange-400";
  return "text-red-400";
};

export const getProfileStrengthLabel = (percentage) => {
  if (percentage >= 80) return "Excellent";
  if (percentage >= 60) return "Good";
  if (percentage >= 40) return "Fair";
  return "Needs Work";
};
