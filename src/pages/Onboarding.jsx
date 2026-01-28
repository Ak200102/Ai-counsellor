import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import { onboarding } from "../helpers/endpoints";
import {
  AcademicCapIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  BanknotesIcon,
  BookOpenIcon,
  SparklesIcon,
  StarIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState({
    // Academic Background
    degree: "", // Bachelor's, Master's, PhD
    subject: "", // Specific subject/major
    university: "", // Current/previous university
    graduationYear: "",
    gpa: "",
    
    // Study Goal
    intendedDegree: "",
    fieldOfStudy: "",
    intakeYear: "",
    preferredCountries: [],
    
    // Budget
    budgetRange: "",
    fundingPlan: "",
    
    // Standardized Tests - English Proficiency
    ieltsTaken: false,
    ieltsScore: {
      overall: "",
      listening: "",
      reading: "",
      writing: "",
      speaking: ""
    },
    toeflTaken: false,
    toeflScore: {
      total: "",
      reading: "",
      listening: "",
      speaking: "",
      writing: ""
    },
    
    // Standardized Tests - Academic
    greTaken: false,
    greScore: {
      verbal: "",
      quantitative: "",
      analytical: "",
      total: ""
    },
    gmatTaken: false,
    gmatScore: {
      verbal: "",
      quantitative: "",
      analytical: "",
      total: ""
    },
    
    // Additional Academic Info
    workExperience: "",
    researchExperience: "",
    publications: "",
    certifications: "",
    
    // Application Readiness
    sopStatus: "",
    lorStatus: "",
    resumeStatus: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();

  const totalSteps = 6; // Academic, Study Goals, Budget, Tests, Experience, Readiness

  const updateData = (field, value) => {
    if (field.includes('.')) {
      // Handle nested object updates like "ieltsScore.overall"
      const [parent, child] = field.split('.');
      setData({ 
        ...data, 
        [parent]: {
          ...(data[parent] || {}),
          [child]: value
        }
      });
    } else {
      // Handle simple field updates
      setData({ ...data, [field]: value });
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setError("");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      await onboarding(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return data.degree && data.subject && data.university && data.gpa && data.graduationYear;
      case 2:
        return data.intendedDegree && data.fieldOfStudy && data.intakeYear && (data.preferredCountries && data.preferredCountries.length > 0);
      case 3:
        return data.budgetRange && data.fundingPlan;
      case 4:
        // For tests step, at least one test should be taken or all should be marked as not taken
        return (data.ieltsTaken || data.toeflTaken || data.greTaken || data.gmatTaken);
      case 5:
        // Experience step is optional
        return true;
      case 6:
        return data.lorStatus && data.resumeStatus;
      default:
        return true;
    }
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 1:
        return <AcademicCapIcon className="w-6 h-6" />;
      case 2:
        return <GlobeAltIcon className="w-6 h-6" />;
      case 3:
        return <CurrencyDollarIcon className="w-6 h-6" />;
      case 4:
        return <DocumentTextIcon className="w-6 h-6" />;
      default:
        return <StarIcon className="w-6 h-6" />;
    }
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1:
        return "Academic Background";
      case 2:
        return "Study Goals";
      case 3:
        return "Budget & Funding";
      case 4:
        return "Standardized Tests";
      case 5:
        return "Experience & Achievements";
      case 6:
        return "Application Readiness";
      default:
        return "";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Degree Level
                </label>
                <select
                  value={data.degree}
                  onChange={(e) => updateData("degree", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select degree</option>
                  <option value="high-school">High School</option>
                  <option value="bachelors">Bachelor's</option>
                  <option value="masters">Master's</option>
                  <option value="phd">PhD</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Major/Subject
                </label>
                <input
                  type="text"
                  value={data.subject}
                  onChange={(e) => updateData("subject", e.target.value)}
                  placeholder="e.g., Computer Science, Mechanical Engineering"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current/Previous University
              </label>
              <input
                type="text"
                value={data.university}
                onChange={(e) => updateData("university", e.target.value)}
                placeholder="e.g., Massachusetts Institute of Technology"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GPA/Grade
                </label>
                <input
                  type="text"
                  value={data.gpa}
                  onChange={(e) => updateData("gpa", e.target.value)}
                  placeholder="e.g., 3.8/4.0 or 85%"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={data.graduationYear}
                  onChange={(e) => updateData("graduationYear", e.target.value)}
                  placeholder="e.g., 2024"
                  min="2020"
                  max="2030"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Intended Degree
              </label>
              <select
                value={data.intendedDegree}
                onChange={(e) => updateData("intendedDegree", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select degree</option>
                <option value="bachelors">Bachelor's</option>
                <option value="masters">Master's</option>
                <option value="phd">PhD</option>
                <option value="diploma">Diploma</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Field of Study
              </label>
              <input
                type="text"
                value={data.fieldOfStudy}
                onChange={(e) => updateData("fieldOfStudy", e.target.value)}
                placeholder="e.g., Data Science, Engineering"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Intake Year
              </label>
              <select
                value={data.intakeYear}
                onChange={(e) => updateData("intakeYear", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select year</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Countries
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["USA", "UK", "Canada", "Australia", "Germany", "Singapore"].map((country) => (
                  <label key={country} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.preferredCountries.includes(country)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateData("preferredCountries", [...data.preferredCountries, country]);
                        } else {
                          updateData("preferredCountries", data.preferredCountries.filter(c => c !== country));
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{country}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget Range (USD per year)
              </label>
              <select
                value={data.budgetRange}
                onChange={(e) => updateData("budgetRange", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select budget range</option>
                <option value="0-20000">$0 - $20,000</option>
                <option value="20000-40000">$20,000 - $40,000</option>
                <option value="40000-60000">$40,000 - $60,000</option>
                <option value="60000+">$60,000+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Funding Plan
              </label>
              <div className="space-y-3">
                {["self-funded", "scholarship", "loan", "family-support"].map((plan) => (
                  <label key={plan} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="funding"
                      value={plan}
                      checked={data.fundingPlan === plan}
                      onChange={(e) => updateData("fundingPlan", e.target.value)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {plan.replace("-", " ")}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* English Proficiency Tests */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <BookOpenIcon className="w-5 h-5 mr-2" />
                English Proficiency Tests
              </h3>
              
              {/* IELTS */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">IELTS</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={data.ieltsTaken}
                      onChange={(e) => updateData("ieltsTaken", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Taken</span>
                  </label>
                </div>
                
                {data.ieltsTaken && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Overall</label>
                      <input
                        type="number"
                        value={data.ieltsScore.overall}
                        onChange={(e) => updateData("ieltsScore.overall", e.target.value)}
                        placeholder="7.5"
                        min="0"
                        max="9"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Listening</label>
                      <input
                        type="number"
                        value={data.ieltsScore.listening}
                        onChange={(e) => updateData("ieltsScore.listening", e.target.value)}
                        placeholder="8.0"
                        min="0"
                        max="9"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reading</label>
                      <input
                        type="number"
                        value={data.ieltsScore.reading}
                        onChange={(e) => updateData("ieltsScore.reading", e.target.value)}
                        placeholder="7.5"
                        min="0"
                        max="9"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Writing</label>
                      <input
                        type="number"
                        value={data.ieltsScore.writing}
                        onChange={(e) => updateData("ieltsScore.writing", e.target.value)}
                        placeholder="7.0"
                        min="0"
                        max="9"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Speaking</label>
                      <input
                        type="number"
                        value={data.ieltsScore.speaking}
                        onChange={(e) => updateData("ieltsScore.speaking", e.target.value)}
                        placeholder="7.5"
                        min="0"
                        max="9"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* TOEFL */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">TOEFL</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={data.toeflTaken}
                      onChange={(e) => updateData("toeflTaken", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Taken</span>
                  </label>
                </div>
                
                {data.toeflTaken && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total</label>
                      <input
                        type="number"
                        value={data.toeflScore.total}
                        onChange={(e) => updateData("toeflScore.total", e.target.value)}
                        placeholder="105"
                        min="0"
                        max="120"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reading</label>
                      <input
                        type="number"
                        value={data.toeflScore.reading}
                        onChange={(e) => updateData("toeflScore.reading", e.target.value)}
                        placeholder="28"
                        min="0"
                        max="30"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Listening</label>
                      <input
                        type="number"
                        value={data.toeflScore.listening}
                        onChange={(e) => updateData("toeflScore.listening", e.target.value)}
                        placeholder="27"
                        min="0"
                        max="30"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Speaking</label>
                      <input
                        type="number"
                        value={data.toeflScore.speaking}
                        onChange={(e) => updateData("toeflScore.speaking", e.target.value)}
                        placeholder="24"
                        min="0"
                        max="30"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Writing</label>
                      <input
                        type="number"
                        value={data.toeflScore.writing}
                        onChange={(e) => updateData("toeflScore.writing", e.target.value)}
                        placeholder="26"
                        min="0"
                        max="30"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Tests */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <AcademicCapIcon className="w-5 h-5 mr-2" />
                Academic Tests
              </h3>
              
              {/* GRE */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">GRE</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={data.greTaken}
                      onChange={(e) => updateData("greTaken", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Taken</span>
                  </label>
                </div>
                
                {data.greTaken && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verbal</label>
                      <input
                        type="number"
                        value={data.greScore.verbal}
                        onChange={(e) => updateData("greScore.verbal", e.target.value)}
                        placeholder="158"
                        min="130"
                        max="170"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantitative</label>
                      <input
                        type="number"
                        value={data.greScore.quantitative}
                        onChange={(e) => updateData("greScore.quantitative", e.target.value)}
                        placeholder="165"
                        min="130"
                        max="170"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Analytical</label>
                      <input
                        type="number"
                        value={data.greScore.analytical}
                        onChange={(e) => updateData("greScore.analytical", e.target.value)}
                        placeholder="4.5"
                        min="0"
                        max="6"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total</label>
                      <input
                        type="number"
                        value={data.greScore.total}
                        onChange={(e) => updateData("greScore.total", e.target.value)}
                        placeholder="323"
                        min="260"
                        max="340"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* GMAT */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">GMAT</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={data.gmatTaken}
                      onChange={(e) => updateData("gmatTaken", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Taken</span>
                  </label>
                </div>
                
                {data.gmatTaken && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verbal</label>
                      <input
                        type="number"
                        value={data.gmatScore.verbal}
                        onChange={(e) => updateData("gmatScore.verbal", e.target.value)}
                        placeholder="38"
                        min="0"
                        max="60"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantitative</label>
                      <input
                        type="number"
                        value={data.gmatScore.quantitative}
                        onChange={(e) => updateData("gmatScore.quantitative", e.target.value)}
                        placeholder="48"
                        min="0"
                        max="60"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Analytical</label>
                      <input
                        type="number"
                        value={data.gmatScore.analytical}
                        onChange={(e) => updateData("gmatScore.analytical", e.target.value)}
                        placeholder="5.0"
                        min="0"
                        max="6"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total</label>
                      <input
                        type="number"
                        value={data.gmatScore.total}
                        onChange={(e) => updateData("gmatScore.total", e.target.value)}
                        placeholder="720"
                        min="200"
                        max="800"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                <BriefcaseIcon className="w-5 h-5 mr-2" />
                Experience & Achievements
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Work Experience
                  </label>
                  <textarea
                    value={data.workExperience}
                    onChange={(e) => updateData("workExperience", e.target.value)}
                    placeholder="Describe your relevant work experience..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Research Experience
                  </label>
                  <textarea
                    value={data.researchExperience}
                    onChange={(e) => updateData("researchExperience", e.target.value)}
                    placeholder="Describe your research projects and experience..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Publications
                  </label>
                  <textarea
                    value={data.publications}
                    onChange={(e) => updateData("publications", e.target.value)}
                    placeholder="List any published papers or articles..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Certifications
                  </label>
                  <textarea
                    value={data.certifications}
                    onChange={(e) => updateData("certifications", e.target.value)}
                    placeholder="List relevant certifications..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Application Readiness
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statement of Purpose (SOP) Status
                  </label>
                  <select
                    value={data.sopStatus}
                    onChange={(e) => updateData("sopStatus", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select status</option>
                    <option value="not-started">Not started</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Letters of Recommendation (LOR) Status
                  </label>
                  <select
                    value={data.lorStatus}
                    onChange={(e) => updateData("lorStatus", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select status</option>
                    <option value="not-started">Not started</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Resume/CV Status
                  </label>
                  <select
                    value={data.resumeStatus}
                    onChange={(e) => updateData("resumeStatus", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select status</option>
                    <option value="not-started">Not started</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center">
                <motion.div
                  animate={{
                    backgroundColor: currentStep >= step ? "rgb(99, 102, 241)" : "rgb(229, 231, 235)",
                    scale: currentStep === step ? 1.1 : 1
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium transition-colors"
                >
                  {currentStep > step ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    getStepIcon(step)
                  )}
                </motion.div>
                {step < totalSteps && (
                  <div
                    animate={{
                      backgroundColor: currentStep > step ? "rgb(99, 102, 241)" : "rgb(229, 231, 235)"
                    }}
                    className="flex-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-4 transition-colors"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="text-center flex-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {getStepTitle(step)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <AcademicCapIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6"
            >
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Form Content */}
          <div className="mb-8">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back
            </motion.button>

            {currentStep < totalSteps ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!validateStep()}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!validateStep() || loading}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014.5 12 8.5 8.5 0 018.5 12h4z" />
                    </svg>
                    Completing...
                  </span>
                ) : (
                  <>
                    Complete Onboarding
                    <CheckCircleIcon className="w-5 h-5 ml-2" />
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-4 gap-4"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <AcademicCapIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Academic</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <GlobeAltIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Global</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CurrencyDollarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Funding</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <DocumentTextIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Documents</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
