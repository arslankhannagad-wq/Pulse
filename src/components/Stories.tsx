import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { Story } from '../types.ts';
import { useAuth } from '../App.tsx';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Stories: React.FC = () => {
  const { profile } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  useEffect(() => {
    // In a real app, you'd filter by expiresAt > now and followed users
    const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const storyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Story[];
      // Filter expired stories on client side for safety (MVP)
      const now = Date.now();
      const validStories = storyData.filter(s => s.expiresAt.toMillis() > now);
      setStories(validStories);
    });
    return () => unsubscribe();
  }, []);

  const handleAddStory = async () => {
    if (!profile) return;
    const mediaUrl = prompt('Enter image/video URL for your story:');
    if (!mediaUrl) return;

    const mediaType = mediaUrl.endsWith('.mp4') ? 'video' : 'photo';
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    try {
      await addDoc(collection(db, 'stories'), {
        userId: profile.uid,
        username: profile.username,
        userPhoto: profile.profilePhoto,
        mediaUrl,
        mediaType,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt)
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4 px-2 scrollbar-hide no-scrollbar">
      {/* Add Story */}
      <div className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer" onClick={handleAddStory}>
        <div className="relative">
          <img
            src={profile?.profilePhoto || 'https://picsum.photos/seed/user/100/100'}
            alt="My Story"
            className="w-16 h-16 rounded-full border-2 border-white p-0.5 object-cover ring-2 ring-gray-200"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full border-2 border-white p-1">
            <Plus size={12} className="text-white" />
          </div>
        </div>
        <span className="text-[10px] text-gray-500 w-16 truncate text-center font-medium">Your Story</span>
      </div>

      {/* Stories List */}
      {stories.map(story => (
        <div 
          key={story.id} 
          className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer"
          onClick={() => setActiveStory(story)}
        >
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-600 ring-2 ring-white">
            <img
              src={story.userPhoto || 'https://picsum.photos/seed/user/100/100'}
              alt={story.username}
              className="w-16 h-16 rounded-full border-2 border-white object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-[10px] text-gray-400 w-16 truncate text-center">{story.username}</span>
        </div>
      ))}

      {/* Story Modal Overlay */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setActiveStory(null)} 
              className="absolute top-6 right-6 text-white z-50 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={32} />
            </button>
            <div className="relative w-full max-w-lg aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl">
              <div className="absolute top-4 left-4 flex items-center space-x-3 z-50">
                <img 
                  src={activeStory.userPhoto} 
                  className="w-8 h-8 rounded-full border-2 border-white"
                  referrerPolicy="no-referrer"
                />
                <span className="text-white font-bold text-sm drop-shadow-md">{activeStory.username}</span>
              </div>
              {activeStory.mediaType === 'video' ? (
                <video src={activeStory.mediaUrl} className="w-full h-full object-contain" autoPlay controls />
              ) : (
                <img src={activeStory.mediaUrl} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Stories;
