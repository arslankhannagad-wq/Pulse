import React, { useState } from 'react';
import { setDoc, doc, Timestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase.ts';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../App.tsx';
import { motion } from 'motion/react';
import { handleFirestoreError } from '../errorUtils.ts';
import { OperationType } from '../types.ts';

const Signup: React.FC = () => {
  const { user, profile } = useAuth();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if username unique
      const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setError('Username is already taken');
        setLoading(false);
        return;
      }

      const userData = {
        username: username.toLowerCase(),
        displayName,
        email: user.email,
        bio,
        profilePhoto: user.photoURL,
        createdAt: Timestamp.now(),
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      navigate('/');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'users');
    } finally {
      setLoading(false);
    }
  };

  if (profile) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white border border-gray-200 p-8 shadow-sm rounded-md"
      >
        <div className="flex flex-col items-center mb-8">
          <img
            src={user?.photoURL || 'https://picsum.photos/seed/user/150/150'}
            alt="Profile"
            className="w-24 h-24 rounded-full border border-gray-200 mb-4 object-cover"
            referrerPolicy="no-referrer"
          />
          <h2 className="text-xl font-bold">Complete your profile</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
              placeholder="username"
              className="w-full bg-gray-50 border border-gray-200 p-2 rounded focus:outline-none focus:border-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display Name"
              className="w-full bg-gray-50 border border-gray-200 p-2 rounded focus:outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 p-2 rounded focus:outline-none focus:border-gray-400 resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Setting up...' : 'Get Started'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
