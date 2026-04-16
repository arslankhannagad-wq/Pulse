import React, { useState } from 'react';
import { signInWithPopup, signInAnonymously } from 'firebase/auth';
import { auth, googleProvider, signInAsGuest } from '../firebase.ts';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google login result:", result);
      if (result?.user) {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await signInAsGuest();
      console.log("Guest login result:", result);
      if (result?.user) {
        navigate("/signup", { replace: true });
      }
    } catch (err: any) {
      console.error("Guest login failed:", err);
      setError(err.message || 'Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white border border-gray-200 p-8 flex flex-col items-center shadow-lg rounded-xl"
      >
        <div className="font-serif text-5xl font-bold text-blue-600 mb-8">Pulse</div>
        
        <p className="text-gray-500 text-center mb-8 font-medium">
          Share your moments with the world.
        </p>

        {error && (
          <div className="w-full bg-red-50 text-red-600 text-sm p-3 rounded mb-4">{error}</div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" referrerPolicy="no-referrer" />
          <span>Log in with Google</span>
        </button>

        <button
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2 mt-3 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Continue as Guest</span>
        </button>

        <div className="flex items-center my-6 w-full">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-400 text-sm font-semibold uppercase">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <p className="text-sm text-gray-400 text-center">
          By signing up, you agree to our Terms, Data Policy and Cookies Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
