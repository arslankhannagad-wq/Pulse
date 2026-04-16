import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { useAuth } from '../App.tsx';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'motion/react';

const Upload: React.FC = () => {
  const { profile } = useAuth();
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !mediaUrl) return;

    setLoading(true);
    try {
      // Extract hashtags
      const hashtagRegex = /#(\w+)/g;
      const hashtags = (caption.match(hashtagRegex) || []).map(h => h.slice(1).toLowerCase());

      await addDoc(collection(db, 'posts'), {
        userId: profile.uid,
        authorUsername: profile.username,
        authorPhoto: profile.profilePhoto,
        mediaUrl,
        mediaType,
        caption,
        location,
        hashtags,
        createdAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
      });

      // Increment user post count
      await updateDoc(doc(db, 'users', profile.uid), {
        postsCount: increment(1)
      });

      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 md:rounded-lg overflow-hidden"
    >
      <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center bg-white sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black">
          <X size={24} />
        </button>
        <h2 className="font-bold">Create new post</h2>
        <button
          onClick={handlePost}
          disabled={loading || !mediaUrl}
          className="text-blue-500 font-bold disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Share'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row min-h-[500px]">
        {/* Preview / Selection */}
        <div className="flex-grow bg-gray-50 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-200">
          {mediaUrl ? (
            <div className="relative group w-full h-full flex items-center justify-center">
              {mediaType === 'video' ? (
                <video
                  src={mediaUrl}
                  className="max-w-full max-h-[500px] object-contain rounded"
                  controls
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt="Preview"
                  className="max-w-full max-h-[500px] object-contain rounded"
                  referrerPolicy="no-referrer"
                />
              )}
              <button
                onClick={() => setMediaUrl('')}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-6 text-center w-full max-w-sm px-6">
              <div className="flex space-x-2 bg-gray-200 p-1 rounded-lg w-full">
                <button
                  onClick={() => setMediaType('photo')}
                  className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-all ${mediaType === 'photo' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Photo
                </button>
                <button
                  onClick={() => setMediaType('video')}
                  className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-all ${mediaType === 'video' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Video
                </button>
              </div>
              <ImageIcon size={64} className="text-gray-300" />
              <div>
                <p className="text-lg font-medium text-gray-700">Paste {mediaType === 'photo' ? 'photo' : 'video'} URL</p>
                <p className="text-sm text-gray-400 mt-1">Direct links work best (mp4, jpg, png)</p>
              </div>
              <input
                type="text"
                placeholder={`https://example.com/media.${mediaType === 'photo' ? 'jpg' : 'mp4'}`}
                className="w-full bg-white border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Caption & Metadata */}
        <div className="w-full md:w-80 flex flex-col">
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-3 mb-2">
              <img
                src={profile?.profilePhoto || 'https://picsum.photos/seed/user/50/50'}
                alt={profile?.username}
                className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="font-semibold text-sm">{profile?.username}</span>
            </div>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={8}
              className="w-full text-sm resize-none focus:outline-none placeholder-gray-400"
            />
          </div>

          <div className="border-t border-gray-100 flex flex-col">
            <div className="px-4 py-3 flex items-center border-b border-gray-100">
              <input
                type="text"
                placeholder="Add location"
                className="text-sm w-full focus:outline-none bg-transparent"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="px-4 py-8 text-gray-400 text-[10px] leading-relaxed">
              <p>Hashtags like #pulse will be automatically detected and used for discovery.</p>
              <p className="mt-2 font-medium">Tip: Use high-quality vertical videos for Reels!</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Upload;
