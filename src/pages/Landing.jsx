import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  UserGroupIcon,
  GlobeAltIcon,
  StarIcon,
  PlayIcon
} from "@heroicons/react/24/outline";

export default function Landing() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.session);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      content: "AI Counsellor helped me find the perfect university in Canada. The personalized recommendations were spot on!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Engineering Student",
      content: "The application tracking system made everything so much easier. I could monitor all my applications in one place.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Business Student",
      content: "The AI-powered career guidance helped me choose the right program and university for my goals.",
      rating: 5
    }
  ];

  // Check if user is already authenticated and redirect to dashboard
  useEffect(() => {
    if (token) {
      console.log("Landing: User already authenticated, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
      return;
    }

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [token, navigate]);

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

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <img 
                  src="/logo.png" 
                  alt="AI Counsellor" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-white font-bold text-xl">AI Counsellor</span>
              </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
              <button
                onClick={() => navigate("/auth/login")}
                className="px-4 py-2 bg-white/10 backdrop-blur-lg text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/auth/signup")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 px-6 py-20">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="inline-flex items-center px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-6">
                <SparklesIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  AI-Powered Study Abroad Guidance
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Your AI-Powered
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  {" "}Study Abroad
                </span>
                <br />
                Journey Starts Here
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                Get personalized university recommendations, track applications, and receive AI-powered guidance for your study abroad journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/auth/signup")}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Get Started Free
                  <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
                </button>
                <button
                  onClick={() => navigate("/auth/login")}
                  className="px-8 py-4 bg-white/10 backdrop-blur-lg text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-10 px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Everything You Need for Your Study Abroad Journey
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our AI-powered platform provides comprehensive tools and guidance to help you succeed.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: AcademicCapIcon,
                  title: "AI University Matching",
                  description: "Get personalized university recommendations based on your profile, preferences, and career goals."
                },
                {
                  icon: GlobeAltIcon,
                  title: "Global University Database",
                  description: "Access detailed information about thousands of universities worldwide with real-time updates."
                },
                {
                  icon: UserGroupIcon,
                  title: "Application Tracking",
                  description: "Track all your applications in one place with deadlines, requirements, and status updates."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="relative z-10 px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                What Students Are Saying
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Join thousands of students who have successfully found their dream universities with AI Counsellor.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all ${
                    index === currentTestimonial ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start Your Study Abroad Journey?
              </h2>
              <p className="text-xl text-gray-200 mb-8">
                Join thousands of students who have found their dream universities with AI Counsellor.
              </p>
              <button
                onClick={() => navigate("/auth/signup")}
                className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started Free
                <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
              </button>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
