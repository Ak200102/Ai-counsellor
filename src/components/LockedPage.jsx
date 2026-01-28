import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LockClosedIcon, 
  SparklesIcon, 
  ArrowRightIcon,
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

export default function LockedPage({ feature = "Feature" }) {
  const navigate = useNavigate();

  const handleGoToCounsellor = () => {
    navigate('/ai-counsellor');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center"
      >
        {/* Lock Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <LockClosedIcon className="w-8 h-8 text-red-400" />
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-4">
          {feature} Locked
        </h1>

        {/* Message */}
        <p className="text-gray-300 mb-6 leading-relaxed">
          Please complete your first AI counselling session to unlock the {feature.toLowerCase()} page. 
          Our AI counsellor will help you get personalized recommendations and guidance.
        </p>

        {/* Benefits */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
          <h3 className="text-white font-semibold mb-3 flex items-center">
            <SparklesIcon className="w-5 h-5 mr-2" />
            What you'll get:
          </h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              Personalized university recommendations
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              Application guidance and timeline
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              Task suggestions for your profile
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              Expert advice on study abroad journey
            </li>
          </ul>
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoToCounsellor}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center group"
        >
          <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
          Start AI Counselling
          <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        {/* Skip Option */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 text-gray-400 hover:text-gray-300 text-sm transition-colors"
        >
          ← Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
}
