import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { askCounsellor, getMe, getUniversities, getConversationHistory, saveConversation } from "../helpers/endpoints";
import api from "../helpers/api";
import { shortlistUniversity, unshortlistUniversity, lockUniversity } from "../helpers/endpoints";
import { createTask } from "../helpers/endpoints";
import { getUniversityIdByName } from "../utils/universityMapping.js";
import VoiceSettings from "../components/VoiceSettings";
import eventBus from "../utils/eventBus";
import {
  UserGroupIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  GlobeAltIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  StopIcon,
  Cog6ToothIcon,
  StarIcon,
  ClipboardDocumentListIcon,
  LockClosedIcon,
  ClockIcon,
  ArrowLeftIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

export default function AICounsellor() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [universities, setUniversities] = useState([]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Function to refresh user data after actions
  const refreshUserData = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
      console.log("User data refreshed after action");
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  // Function to delete chat history
  const deleteChatHistory = async () => {
    if (!window.confirm("Are you sure you want to delete all chat history? This cannot be undone.")) {
      return;
    }

    try {
      const response = await api.delete("/api/counsellor/history");
      
      // Clear local state
      setChatHistory([]);
      setMessages([]);
      setShowChatHistory(false);
      setActionMessage(response.data.message || "Chat history deleted successfully");
      setTimeout(() => setActionMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting chat history:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete chat history";
      setActionMessage(`Error: ${errorMessage}`);
      setTimeout(() => setActionMessage(""), 5000);
    }
  };

  // Auto-save conversation on unmount or when leaving page
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveCurrentConversation();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Save conversation when component unmounts
    return () => {
      saveCurrentConversation();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [messages]);

  // Auto-save after each new message
  useEffect(() => {
    if (messages.length > 0) {
      // Save conversation 2 seconds after last message to avoid spam
      const timer = setTimeout(() => {
        saveCurrentConversation();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Save current conversation to database (silent - no user feedback)
  const saveCurrentConversation = async () => {
    if (messages.length === 0) return;

    try {
      setIsSaving(true);
      const response = await saveConversation(messages);
      console.log("Conversation auto-saved successfully:", response.data);
      
      // Refresh chat history after saving
      await fetchConversationHistory();
    } catch (error) {
      console.error("Error auto-saving conversation:", error);
      // Don't show error to user for auto-save to avoid annoyance
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch conversation history
  const fetchConversationHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await getConversationHistory();
      setChatHistory(response.data.messages || []);
      console.log("Conversation history loaded:", response.data.messages?.length || 0, "messages");
    } catch (error) {
      console.error("Error fetching conversation history:", error);
      setChatHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Find university by name
  const findUniversityByName = async (name) => {
    console.log("findUniversityByName called with:", name);
    console.log("Current universities in state:", universities.length);
    
    if (!universities.length) {
      console.log("Fetching universities from API...");
      try {
        const response = await getUniversities();
        const uniData = response.data.data || [];
        console.log("Fetched universities:", uniData.length);
        setUniversities(uniData);
        
        // Log some university names for debugging
        console.log("Sample university names:", uniData.slice(0, 5).map(u => u.name));
      } catch (error) {
        console.error("Failed to fetch universities:", error);
        return null;
      }
    }
    
    // Try multiple search approaches
    const university = universities.find(u => {
      const uniName = u.name.toLowerCase();
      const searchName = name.toLowerCase();
      
      // Exact match
      if (uniName === searchName) return true;
      
      // Contains match
      if (uniName.includes(searchName) || searchName.includes(uniName)) return true;
      
      // Partial word match
      const uniWords = uniName.split(' ');
      const searchWords = searchName.split(' ');
      
      return uniWords.some(uniWord => 
        searchWords.some(searchWord => 
          uniWord.includes(searchWord) || searchWord.includes(uniWord)
        )
      );
    });
    
    console.log("Search result:", university ? university.name : "Not found");
    return university;
  };

  useEffect(() => {
    fetchUserData();
    fetchConversationHistory(); // Load chat history on component mount
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
    }
    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await getMe();
      console.log("AI Counsellor user response:", response);
      
      // Handle different response structures
      const userData = response.data || response;
      console.log("Setting AI Counsellor user data:", userData);
      setUser(userData);
    } catch (err) {
      console.error("Failed to load user data:", err);
      setError(err.response?.data?.message || "Failed to load user data");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Voice recognition setup
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voice recognition is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Voice recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    window.speechSynthesis.cancel();
    setIsListening(false);
  };

  // Text-to-speech function
  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) {
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (isSpeaking) {
      stopSpeaking();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);
    setError("");

    try {
      console.log("Sending message to AI:", inputMessage);
      console.log("User's shortlisted universities:", user?.profile?.shortlistedUniversities?.map(u => {
      console.log("University object:", u);
      console.log("University ID:", u.universityId);
      console.log("University name:", u.universityId?.name);
      return u.universityId?.name || 'Unknown';
    }));
      console.log("Shortlisted universities raw:", user?.profile?.shortlistedUniversities);
      
      // Check if user is asking to lock a university that's already shortlisted
      const isLockRequest = inputMessage.toLowerCase().includes('lock');
      const universityName = inputMessage.match(/lock\s+(.+?)(?:\s+for|\s*$)/i)?.[1]?.trim();
      
      if (isLockRequest && universityName) {
        const isShortlisted = user?.profile?.shortlistedUniversities?.some(u => 
          u.universityName === universityName
        );
        console.log(`Is ${universityName} shortlisted?`, isShortlisted);
        
        if (isShortlisted) {
          console.log("University is shortlisted, should generate LOCK_UNIVERSITY action");
        }
      }
      
      // Build comprehensive user profile context for AI
      const profile = user?.profile || {};
      const profileContext = `
        COMPLETE USER PROFILE FOR AI ANALYSIS:
        
        🎓 ACADEMIC BACKGROUND:
        - Current Degree Level: ${profile.academic?.level || 'Not specified'}
        - Major/Subject: ${profile.academic?.major || 'Not specified'}
        - Current University: ${profile.academic?.university || 'Not specified'}
        - Graduation Year: ${profile.academic?.graduationYear || 'Not specified'}
        - GPA: ${profile.academic?.gpa || 'Not specified'}
        
        🎯 STUDY GOALS:
        - Intended Degree: ${profile.studyGoal?.degree || 'Not specified'}
        - Target Field of Study: ${profile.studyGoal?.field || 'Not specified'}
        - Intake Year: ${profile.studyGoal?.intakeYear || 'Not specified'}
        - Preferred Countries: ${profile.studyGoal?.countries?.join(', ') || 'Not specified'}
        
        💰 BUDGET & FUNDING:
        - Budget Range: ${profile.budget?.range || 'Not specified'}
        - Funding Plan: ${profile.budget?.funding || 'Not specified'}
        
        📝 STANDARDIZED TESTS:
        - IELTS: ${profile.ieltsTaken ? `Taken (Score: ${profile.ieltsScore?.overall || 'Not specified'})` : 'Not taken'}
        - TOEFL: ${profile.toeflTaken ? `Taken (Score: ${profile.toeflScore?.total || 'Not specified'})` : 'Not taken'}
        - GRE: ${profile.greTaken ? `Taken (Score: ${profile.greScore?.total || 'Not specified'})` : 'Not taken'}
        - GMAT: ${profile.gmatTaken ? `Taken (Score: ${profile.gmatScore?.total || 'Not specified'})` : 'Not taken'}
        
        📚 ADDITIONAL ACADEMIC INFO:
        - Work Experience: ${profile.workExperience || 'Not specified'}
        - Research Experience: ${profile.researchExperience || 'Not specified'}
        - Publications: ${profile.publications || 'Not specified'}
        - Certifications: ${profile.certifications || 'Not specified'}
        
        📄 APPLICATION READINESS:
        - SOP Status: ${profile.sopStatus || 'Not specified'}
        - LOR Status: ${profile.lorStatus || 'Not specified'}
        - Resume Status: ${profile.resumeStatus || 'Not specified'}
        
        🏛️ UNIVERSITY STATUS:
        - Shortlisted Universities: ${user?.profile?.shortlistedUniversities?.map(u => u.universityId?.name || u.universityId?.universityId?.name || 'Unknown').join(', ') || 'None'}
        - Locked University: ${user?.profile?.lockedUniversity?.universityId?.name || 'None'}
        - Number of Shortlisted: ${user?.profile?.shortlistedUniversities?.length || 0}
        
        📊 PROFILE COMPLETION: ${profile.completionPercentage || 0}%
        
        AI ANALYSIS INSTRUCTIONS:
        1. Use the academic background (${profile.academic?.level || 'Not specified'} in ${profile.academic?.major || 'Not specified'}) to assess eligibility
        2. Consider study goals (${profile.studyGoal?.degree || 'Not specified'} in ${profile.studyGoal?.field || 'Not specified'}) for recommendations
        3. Factor in budget constraints (${profile.budget?.range || 'Not specified'}) when suggesting universities
        4. Account for preferred countries (${profile.studyGoal?.countries?.join(', ') || 'Not specified'}) in recommendations
        5. Consider test scores for admission requirements
        6. Evaluate application readiness and provide next steps
        7. Provide personalized advice based on complete profile
      `;
      
      // Send only the user message - backend will handle profile data separately
      const response = await askCounsellor(inputMessage);
      console.log("AI Response received:", response);
      console.log("AI Recommendations Response:", response.data);
      console.log("AI Response actionableNextSteps:", response.data.actionableNextSteps);
      console.log("AI Response action:", response.data.action);
      
      setAiRecommendations(response.data);
      console.log("Response data keys:", Object.keys(response.data || {}));
      
      // Ensure response is valid and safe
      let safeResponse = {};
      let messageContent = "I'm here to help with your study-abroad journey.";
      
      if (response && response.data && typeof response.data === 'object') {
        safeResponse = response.data;
        messageContent = response.data.message || response.data.content || messageContent;
        console.log("Extracted message content from response.data:", messageContent);
      } else if (response && typeof response === 'object') {
        safeResponse = response;
        messageContent = response.message || response.content || messageContent;
        console.log("Extracted message content from response:", messageContent);
      } else if (typeof response === 'string') {
        messageContent = response;
        console.log("Using string response:", messageContent);
      } else {
        console.log("Invalid response type, using fallback message");
      }
      
      // Add AI response with only safe data
      const aiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: messageContent,
        timestamp: new Date().toISOString(),
        // Only include safe, validated data from response.data
        actionableNextSteps: Array.isArray(safeResponse.actionableNextSteps) ? safeResponse.actionableNextSteps : [],
        collegeRecommendations: Array.isArray(safeResponse.collegeRecommendations) ? safeResponse.collegeRecommendations : [],
        profileAnalysis: safeResponse.profileAnalysis && typeof safeResponse.profileAnalysis === 'object' ? safeResponse.profileAnalysis : null,
        profileAssessment: safeResponse.profileAssessment && typeof safeResponse.profileAssessment === 'object' ? safeResponse.profileAssessment : null,
        action: safeResponse.action || "NONE",
        task: safeResponse.task && typeof safeResponse.task === 'object' ? safeResponse.task : null,
        universityName: safeResponse.universityName || null,
        autoShortlistedResults: Array.isArray(safeResponse.autoShortlistedResults) ? safeResponse.autoShortlistedResults : Array.isArray(safeResponse.autoShortlisted) ? safeResponse.autoShortlisted : []
      };
      
      console.log("AI Message to display:", aiMsg);
      console.log("Has actionableNextSteps:", !!aiMsg.actionableNextSteps, "Count:", aiMsg.actionableNextSteps.length);
      console.log("Has collegeRecommendations:", !!aiMsg.collegeRecommendations, "Count:", aiMsg.collegeRecommendations.length);
      console.log("Has profileAssessment:", !!aiMsg.profileAssessment);
      
      setMessages(prev => [...prev, aiMsg]);
      
      // Speak the AI response if voice is enabled
      if (voiceEnabled && messageContent) {
        speakText(messageContent);
      }

      // Handle AI-suggested actions (only if response is valid object)
      if (safeResponse.action && safeResponse.action !== "NONE") {
        console.log("AI suggested action:", safeResponse.action);
        
        if (safeResponse.action === "SHORTLIST_UNIVERSITY" && safeResponse.universityShortlisted) {
          console.log("University shortlisted:", safeResponse.universityShortlisted);
          // Refresh user data to show new universities in Universities page
          await refreshUserData();
        }
        
        if (safeResponse.action === "CREATE_TASK" && safeResponse.taskCreated) {
          console.log("Task created:", safeResponse.taskCreated);
          // Refresh user data to show new task in Tasks page
          await refreshUserData();
        }

        if (safeResponse.action === "AUTO_SHORTLIST_MULTIPLE" && safeResponse.autoShortlistedResults) {
          console.log("Auto-shortlisted universities:", safeResponse.autoShortlistedResults);
          setActionMessage(`Auto-shortlisted ${safeResponse.autoShortlistedResults.length || 0} universities`);
          await refreshUserData();
          setTimeout(() => setActionMessage(""), 3000);
        }
        
        // Handle auto-created tasks from shortlisting
        if ((safeResponse.taskCreated && safeResponse.taskCreated.title) || (safeResponse.action === "AUTO_SHORTLIST_MULTIPLE" && safeResponse.autoShortlisted && safeResponse.autoShortlisted.length > 0)) {
          console.log("Auto-created task detected:", safeResponse.taskCreated);
          const taskTitle = safeResponse.taskCreated?.title || "Review and compare shortlisted universities";
          setActionMessage(`Task created: ${taskTitle}`);
          await refreshUserData();
          setTimeout(() => setActionMessage(""), 3000);
        }
        
        if (safeResponse.action === "LOCK_UNIVERSITY" && safeResponse.universityLocked) {
          console.log("University locked:", safeResponse.universityLocked);
          // Refresh user data to show locked university in Universities page
          await refreshUserData();
          setTimeout(() => {
            navigate("/application-guidance");
          }, 2000);
        }
        
        if (safeResponse.action === "CREATE_TASK" && safeResponse.taskCreated) {
          console.log("Task created:", safeResponse.taskCreated);
          setActionMessage(`Task created: ${safeResponse.taskCreated.title}`);
          // Refresh user data to show new task in Tasks page
          await refreshUserData();
          setTimeout(() => setActionMessage(""), 3000);
        }
      }
    } catch (err) {
      console.error("AI Counsellor Error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to get AI response. Please try again.";
      setError(errorMessage);
      
      // Add error message to chat
      const errorMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSendMessage();
    }
  };

  const renderMessage = (message) => {
    const isUser = message.role === "user";
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      >
        {!isUser && (
          <div className="flex items-center space-x-2 mr-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <UserCircleIcon className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
        <div className={`max-w-3xl px-4 py-3 rounded-2xl ${
          isUser 
            ? "bg-blue-600 text-white ml-auto" 
            : "bg-white/10 backdrop-blur-lg border border-white/20 text-gray-900 dark:text-white"
        }`}>
          <p className="text-sm leading-relaxed">{typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}</p>
          
          {/* Render actionable next steps if available */}
          {message.actionableNextSteps && Array.isArray(message.actionableNextSteps) && message.actionableNextSteps.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.actionableNextSteps.map((action, index) => {
                if (!action || typeof action !== 'object') {
                  return null;
                }
                return (
                  <button
                    key={index}
                    onClick={async () => {
                      console.log("AI-generated button clicked:", action);
                      console.log("Action type:", action.action);
                      console.log("University name:", action.universityName);
                      try {
                        if (action.action === "SHORTLIST_UNIVERSITY") {
                          console.log("Executing SHORTLIST_UNIVERSITY action for:", action.universityName);
                          // Try to find university ID from AI's college recommendations first
                          let universityId = action.universityId;
                          
                          if (!universityId && action.universityName) {
                            // Search through all college recommendations in messages
                            const allCollegeRecommendations = messages
                              .filter(msg => msg.collegeRecommendations && Array.isArray(msg.collegeRecommendations))
                              .flatMap(msg => msg.collegeRecommendations);
                            
                            const foundUniversity = allCollegeRecommendations.find(
                              college => college.name === action.universityName
                            );
                            
                            if (foundUniversity && foundUniversity._id) {
                              universityId = foundUniversity._id;
                              console.log("Found university ID from AI recommendations:", universityId);
                            }
                          }
                          
                          // If still not found, try university mapping
                          if (!universityId && action.universityName) {
                            universityId = getUniversityIdByName(action.universityName);
                            console.log("Found university ID from mapping:", universityId);
                          }
                          
                          // If still not found, try database search as last resort
                          if (!universityId && action.universityName) {
                            console.log("Searching for university by name:", action.universityName);
                            const university = await findUniversityByName(action.universityName);
                            if (university && university._id) {
                              universityId = university._id;
                              console.log("Found university ID from database:", universityId);
                            }
                          }
                          
                          // If we have universityId, use it; otherwise send universityName to backend
                          if (universityId) {
                            await shortlistUniversity(universityId);
                            setActionMessage(`Shortlisted ${action.universityName || 'University'}`);
                          } else {
                            // Send universityName to backend for lookup
                            await shortlistUniversity(null, action.universityName);
                            setActionMessage(`Shortlisted ${action.universityName || 'University'}`);
                          }
                          // Refresh user data to show new university in Universities page
                          await refreshUserData();
                        } else if (action.action === "CREATE_TASK") {
                          await createTask({
                            title: action.taskTitle,
                            description: action.taskReason || 'Task created by AI Counsellor',
                            priority: 'HIGH',
                            category: 'PROFILE',
                            status: 'NOT_STARTED'
                          });
                          setActionMessage(`Created task: ${action.taskTitle || 'Task'}`);
                          // Refresh user data to show new task in Tasks page
                          await refreshUserData();
                        } else if (action.action === "LOCK_UNIVERSITY") {
                          console.log("Executing LOCK_UNIVERSITY action for:", action.universityName);
                          let universityId = action.universityId;
                          
                          // If no universityId, try to find it like in SHORTLIST_UNIVERSITY
                          if (!universityId && action.universityName) {
                            // Search through all college recommendations in messages
                            const allCollegeRecommendations = messages
                              .filter(msg => msg.collegeRecommendations && Array.isArray(msg.collegeRecommendations))
                              .flatMap(msg => msg.collegeRecommendations);
                            
                            const foundUniversity = allCollegeRecommendations.find(
                              college => college.name === action.universityName
                            );
                            
                            if (foundUniversity && foundUniversity._id) {
                              universityId = foundUniversity._id;
                              console.log("Found university ID from AI recommendations:", universityId);
                            }
                          }
                          
                          // If still not found, try university mapping
                          if (!universityId && action.universityName) {
                            universityId = getUniversityIdByName(action.universityName);
                            console.log("Found university ID from mapping:", universityId);
                          }
                          
                          // Use universityId if available, otherwise send universityName
                          if (universityId) {
                            console.log("About to call lockUniversity with ID:", universityId);
                            try {
                              await lockUniversity(universityId);
                              setActionMessage(`Locked ${action.universityName || 'University'}`);
                              // Set flag to indicate lock action happened
                              sessionStorage.setItem('lastUniversityLock', Date.now());
                              // Refresh user data to show locked university in Universities page
                              await refreshUserData();
                            } catch (lockError) {
                              console.error("lockUniversity call failed:", lockError);
                              setActionMessage(`Failed to lock ${action.universityName || 'University'}`);
                            }
                          } else {
                            await lockUniversity(null, action.universityName);
                            setActionMessage(`Locked ${action.universityName || 'University'}`);
                            // Set flag to indicate lock action happened
                            sessionStorage.setItem('lastUniversityLock', Date.now());
                            // Refresh user data to show locked university in Universities page
                            await refreshUserData();
                          }
                        }
                        setTimeout(() => setActionMessage(""), 3000);
                      } catch (error) {
                        console.error("Failed to execute action:", error);
                        setActionMessage(`Failed to execute action: ${action.text || 'Unknown action'}`);
                        setTimeout(() => setActionMessage(""), 3000);
                      }
                    }}
                    className="w-full text-left px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {action.action === "SHORTLIST_UNIVERSITY" && <StarIcon className="w-4 h-4" />}
                    {action.action === "CREATE_TASK" && <ClipboardDocumentListIcon className="w-4 h-4" />}
                    {action.action === "LOCK_UNIVERSITY" && <LockClosedIcon className="w-4 h-4" />}
                    {action.text || 'Execute Action'}
                  </button>
                );
              })}
            </div>
          )}

          {/* Render comprehensive profile analysis */}
          {message.profileAnalysis && typeof message.profileAnalysis === 'object' && (
            <div className="mt-3 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-lg border border-white/10 rounded-lg">
              <p className="text-sm font-semibold text-purple-300 mb-3">📊 Profile Analysis</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <span className="text-xs text-gray-400">Academic Strength:</span>
                  <span className={`ml-2 text-xs font-medium ${
                    message.profileAnalysis.academicStrength === 'Exceptional' ? 'text-green-400' :
                    message.profileAnalysis.academicStrength === 'Strong' ? 'text-blue-400' :
                    message.profileAnalysis.academicStrength === 'Average' ? 'text-yellow-400' :
                    message.profileAnalysis.academicStrength === 'Weak' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>{message.profileAnalysis.academicStrength || 'Not assessed'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Experience Level:</span>
                  <span className={`ml-2 text-xs font-medium ${
                    message.profileAnalysis.experienceLevel === 'Extensive' ? 'text-green-400' :
                    message.profileAnalysis.experienceLevel === 'Good' ? 'text-blue-400' :
                    message.profileAnalysis.experienceLevel === 'Basic' ? 'text-yellow-400' :
                    message.profileAnalysis.experienceLevel === 'None' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>{message.profileAnalysis.experienceLevel || 'Not assessed'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Readiness Score:</span>
                  <span className={`ml-2 text-xs font-medium ${
                    message.profileAnalysis.readinessScore === 'High' ? 'text-green-400' :
                    message.profileAnalysis.readinessScore === 'Medium' ? 'text-yellow-400' :
                    message.profileAnalysis.readinessScore === 'Low' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>{message.profileAnalysis.readinessScore || 'Not assessed'}</span>
                </div>
              </div>

              {message.profileAnalysis.profileGaps && Array.isArray(message.profileAnalysis.profileGaps) && message.profileAnalysis.profileGaps.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">Areas to Improve:</p>
                  <ul className="list-disc list-inside">
                    {message.profileAnalysis.profileGaps.map((gap, index) => (
                      <li key={index} className="text-xs text-yellow-300">{gap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {message.profileAnalysis.nextSteps && Array.isArray(message.profileAnalysis.nextSteps) && message.profileAnalysis.nextSteps.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Recommended Next Steps:</p>
                  <ul className="list-disc list-inside">
                    {message.profileAnalysis.nextSteps.map((step, index) => (
                      <li key={index} className="text-xs text-green-300">{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Render enhanced college recommendations with explanations */}
          {message.collegeRecommendations && Array.isArray(message.collegeRecommendations) && message.collegeRecommendations.length > 0 && (
            <div className="mt-3 p-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg">
              <p className="text-sm font-semibold text-blue-300 mb-3">🎓 University Recommendations</p>
              
              <div className="space-y-3">
                {message.collegeRecommendations.map((college, index) => {
                  if (!college || typeof college !== 'object') {
                    return null;
                  }
                  return (
                    <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-white">{college.name || 'University'}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          college.category === 'DREAM' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          college.category === 'TARGET' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                          college.category === 'SAFE' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}>{college.category || 'UNKNOWN'}</span>
                      </div>
                      
                      {college.fitExplanation && typeof college.fitExplanation === 'string' && (
                        <p className="text-xs text-green-300 mb-2">
                          <span className="font-medium">Why it fits:</span> {college.fitExplanation}
                        </p>
                      )}
                      
                      {college.riskFactors && Array.isArray(college.riskFactors) && college.riskFactors.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-yellow-300 font-medium">Risk Factors:</p>
                          <ul className="list-disc list-inside">
                            {college.riskFactors.map((risk, riskIndex) => (
                              <li key={riskIndex} className="text-xs text-yellow-200">{risk}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {college.programs && Array.isArray(college.programs) && college.programs.length > 0 && (
                        <div>
                          <p className="text-xs text-blue-300 font-medium">Relevant Programs:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {college.programs.map((program, programIndex) => (
                              <span key={programIndex} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                {program}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-green-400 mt-3">✓ Universities have been auto-shortlisted to your profile</p>
            </div>
          )}

          {/* Render decision guidance */}
          {message.decisionGuidance && typeof message.decisionGuidance === 'object' && (
            <div className="mt-3 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-lg border border-white/10 rounded-lg">
              <p className="text-sm font-semibold text-green-300 mb-3">🎯 Decision Guidance</p>
              
              {message.decisionGuidance.keyFactors && Array.isArray(message.decisionGuidance.keyFactors) && message.decisionGuidance.keyFactors.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">Key Factors to Consider:</p>
                  <ul className="list-disc list-inside">
                    {message.decisionGuidance.keyFactors.map((factor, index) => (
                      <li key={index} className="text-xs text-blue-300">{factor}</li>
                    ))}
                  </ul>
                </div>
              )}

              {message.decisionGuidance.tradeoffs && Array.isArray(message.decisionGuidance.tradeoffs) && message.decisionGuidance.tradeoffs.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">Trade-offs to Weigh:</p>
                  <ul className="list-disc list-inside">
                    {message.decisionGuidance.tradeoffs.map((tradeoff, index) => (
                      <li key={index} className="text-xs text-yellow-300">{tradeoff}</li>
                    ))}
                  </ul>
                </div>
              )}

              {message.decisionGuidance.recommendations && Array.isArray(message.decisionGuidance.recommendations) && message.decisionGuidance.recommendations.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Recommendations:</p>
                  <ul className="list-disc list-inside">
                    {message.decisionGuidance.recommendations.map((rec, index) => (
                      <li key={index} className="text-xs text-green-300">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 px-4 sm:px-6 lg:px-8 py-8">
      {/* Action Message Display */}
      {actionMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="p-4 rounded-lg border bg-green-500/20 border-green-500 text-green-300">
            <p className="text-sm font-medium">{actionMessage}</p>
          </div>
        </div>
      )}
      
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        </motion.div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Counsellor</h1>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-300 text-sm">
                    Your personal study-abroad guide
                  </p>
                  {isSaving && (
                    <div className="flex items-center space-x-1 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs">Auto-saving...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowChatHistory(true);
                  fetchConversationHistory();
                }}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                title="Chat History"
              >
                <ClockIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowVoiceSettings(true)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                title="Voice Settings"
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Welcome to AI Counsellor
                </h3>
                <p className="text-gray-300 text-lg max-w-md">
                  I'm here to guide you through your study-abroad journey. 
                  Ask me anything about universities, applications, or your profile.
                </p>
                <div className="mt-6">
                  <div className="inline-flex flex-col space-y-2">
                    <button
                      onClick={() => {
                        setInputMessage("Tell me about my profile");
                        handleSendMessage();
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                      Profile Assessment
                    </button>
                    <button
                      onClick={() => {
                        setInputMessage("Recommend universities for Computer Science");
                        handleSendMessage();
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <GlobeAltIcon className="w-4 h-4 mr-2" />
                      Get Recommendations
                    </button>
                    <button
                      onClick={() => {
                        setInputMessage("What should I focus on now?");
                        handleSendMessage();
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                      Next Steps
                    </button>
                    <button
                      onClick={startListening}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <MicrophoneIcon className="w-4 h-4 mr-2" />
                      Start Voice Chat
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={message.id || `msg-${index}`}>
                    {renderMessage(message)}
                  </div>
                ))}
              </div>
            )}
            
            {isTyping && (
              <div className="flex items-center space-x-2 px-4 py-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400 text-sm">AI is thinking...</span>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-b-2xl p-4">
          <div className="flex items-end space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your AI counsellor anything..."
              className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            
            {/* Voice Input Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
              className={`p-3 rounded-xl transition-colors ${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-gray-600 hover:bg-gray-700'
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <StopIcon className="w-5 h-5" />
              ) : (
                <MicrophoneIcon className="w-5 h-5" />
              )}
            </button>

            {/* Voice Output Toggle Button */}
            <button
              onClick={toggleVoice}
              disabled={isLoading}
              className={`p-3 rounded-xl transition-colors ${
                voiceEnabled 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              title={voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
            >
              {isSpeaking ? (
                <StopIcon className="w-5 h-5" />
              ) : (
                <SpeakerWaveIcon className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Voice Status Indicator */}
          {(isListening || isSpeaking) && (
            <div className="mt-3 flex items-center space-x-2 text-sm">
              {isListening && (
                <div className="flex items-center space-x-2 text-red-400">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span>Listening...</span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center space-x-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Speaking...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-4 mb-4 p-4 bg-red-500/20 border border-red-500 rounded-xl">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Voice Settings Modal */}
      <VoiceSettings
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
        speechRate={speechRate}
        setSpeechRate={setSpeechRate}
        speechPitch={speechPitch}
        setSpeechPitch={setSpeechPitch}
      />

      {/* Chat History Modal */}
      <AnimatePresence>
        {showChatHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowChatHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-6 h-6 text-white" />
                    <h2 className="text-xl font-bold text-white">Chat History</h2>
                    <span className="text-blue-100 text-sm">
                      {messages.length + chatHistory.length} messages
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={deleteChatHistory}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                      title="Delete Chat History"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowChatHistory(false)}
                      className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat History Content */}
              <div className="flex-1 overflow-y-auto p-6 max-h-[60vh]">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-300">Loading chat history...</span>
                  </div>
                ) : chatHistory.length === 0 && messages.length === 0 ? (
                  <div className="text-center py-12">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No Chat History</h3>
                    <p className="text-gray-500">Start a conversation with your AI counsellor to see your chat history here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Combine current messages with saved history */}
                    {[...messages, ...chatHistory].map((message, index) => (
                      <motion.div
                        key={`message-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                          <div className={`p-4 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                              : 'bg-slate-700 text-gray-100 border border-slate-600'
                          }`}>
                            <div className="flex items-center space-x-2 mb-2">
                              {message.role === 'user' ? (
                                <UserCircleIcon className="w-4 h-4" />
                              ) : (
                                <SparklesIcon className="w-4 h-4" />
                              )}
                              <span className="text-xs font-medium opacity-75">
                                {message.role === 'user' ? 'You' : 'AI Counsellor'}
                              </span>
                              {messages.includes(message) && (
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                  Current Session
                                </span>
                              )}
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <div className="mt-2 text-xs opacity-60">
                              {message.timestamp 
                                ? new Date(message.timestamp).toLocaleString()
                                : 'Just now'
                              }
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-slate-800 border-t border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Showing your recent conversations with the AI counsellor
                  </p>
                  <button
                    onClick={() => setShowChatHistory(false)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
