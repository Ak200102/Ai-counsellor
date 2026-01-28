import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LockedPage from './LockedPage';
import { checkAiCounsellingStatus } from '../helpers/endpoints';

const withAiCounsellingCheck = (WrappedComponent, featureName) => {
  return function AiCounsellingCheckedComponent(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
      const checkStatus = async () => {
        try {
          const response = await checkAiCounsellingStatus();
          const aiCompleted = response.data.aiCounsellingCompleted;
          setIsLocked(!aiCompleted);
        } catch (error) {
          console.error('Error checking AI counselling status:', error);
          // If error occurs, allow access (fail-safe)
          setIsLocked(false);
        } finally {
          setIsLoading(false);
        }
      };

      checkStatus();
    }, []);

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      );
    }

    if (isLocked) {
      return <LockedPage feature={featureName} />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAiCounsellingCheck;
