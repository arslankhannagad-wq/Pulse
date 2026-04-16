import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { useAuth } from '../App.tsx';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Camera } from 'lucide-react';

const EditProfile: React.FC = () => {
  const { profile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [profilePhoto, setProfilePhoto] = useState(profile?.profilePhoto || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        displayName,
        bio,
        profilePhoto
      });
      navigate(`/p/${profile.username}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white border border-gray-200 md:rounded-xl overflow-hidden shadow-sm"
    >
      <div className="border-b border-gray-200 px-4 py-3 flex items-center space-x-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-lg">Edit Profile</h2>
      </div>

      <form onSubmit={handleUpdate} className="p-6 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group cursor-pointer" onClick={() => {
            const url = prompt('Enter new profile photo URL:');
            if (url) setProfilePhoto(url);
          }}>
            <img
              src={profilePhoto || 'https://picsum.photos/seed/user/150/150'}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-50"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={24} />
            </div>
          </div>
          <span className="text-blue-500 font-bold text-sm cursor-pointer hover:text-blue-600">Change Profile Photo</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Username</label>
            <input
              type="text"
              disabled
              className="w-full bg-gray-100 border border-gray-200 p-2.5 rounded-lg text-gray-400 cursor-not-allowed"
              value={profile?.username}
            />
            <p className="text-[10px] text-gray-400 mt-1">Username cannot be changed in this version.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bio</label>
            <textarea
              className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white font-bold py-2.5 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-md shadow-blue-500/20"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditProfile;
