import React, { useState } from 'react';
import { signInWithGoogle } from '../firebase/services';
import { useAuth } from '../context/AuthContext';

const GoogleLoginButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setNeedsOnboarding } = useAuth();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { needsOnboarding } = await signInWithGoogle();
      setNeedsOnboarding(needsOnboarding);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="flex items-center justify-center w-full px-4 py-2 text-white bg-pastel-orange rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
    >
      {isLoading ? (
        <div className="flex items-center">
          <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Signing in...</span>
        </div>
      ) : (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#ffffff"
              d="M12.545 12.151L12.545 12.151L12.545 12.151H7.266V14.536H10.545C10.221 15.648 9.243 16.331 7.867 16.331C6.134 16.331 4.726 14.916 4.726 13.184C4.726 11.451 6.134 10.036 7.867 10.036C8.6 10.036 9.275 10.284 9.801 10.708L11.551 8.958C10.551 8.035 9.273 7.484 7.867 7.484C4.735 7.484 2.173 10.026 2.173 13.184C2.173 16.341 4.735 18.883 7.867 18.883C11.343 18.883 13.747 16.315 13.279 12.905L12.545 12.151Z"
            />
            <path
              fill="#ffffff"
              d="M21.826 12.228H20.17V10.572H18.56V12.228H16.904V13.839H18.56V15.494H20.17V13.839H21.826V12.228Z"
            />
          </svg>
          <span>Sign in with Google</span>
        </div>
      )}
    </button>
  );
};

export default GoogleLoginButton; 