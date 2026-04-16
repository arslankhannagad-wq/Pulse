import React, { useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { useAuth } from '../App.tsx';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, X, Upload as UploadIcon, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Upload: React.FC = () => {
  const { profile } = useAuth();
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      setMediaType('photo');
    } else if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else {
      alert('Only images and videos are supported.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // For MVP, we use base64 if it's small, or object URL
      // If result is huge (> 1MB), Firestore will fail. 
      // We'll use object URL for preview and show a warning
      const objectUrl = URL.createObjectURL(file);
      setMediaUrl(objectUrl);
      
      // If the file is small enough, let's try to use base64 for persistence
      if (file.size < 800000) {
        setMediaUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

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
      if (err instanceof Error && err.message.includes('too large')) {
        alert('File is too large for the database. Please use a smaller file or a URL.');
      }
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
        <div 
          className={`flex-grow flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-200 transition-all ${isDragging ? 'bg-blue-50 border-2 border-dashed border-blue-400' : 'bg-gray-50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
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
              {mediaUrl.startsWith('data:') && (
                <div className="absolute bottom-2 left-2 bg-blue-500/80 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm">
                  Persistent Upload
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-6 text-center w-full max-w-sm px-6">
              <div 
                className="w-full flex flex-col items-center space-y-4 cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <UploadIcon size={40} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800">Select photos and videos</p>
                  <p className="text-sm text-gray-500 mt-1">Drag and drop here, or click to browse</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                />
              </div>

              <div className="w-full flex items-center space-x-3 text-gray-400">
                <div className="flex-grow h-px bg-gray-200"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest">or paste url</span>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>

              <div className="w-full relative">
                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Paste media URL...`}
                  className="w-full bg-white border border-gray-200 pl-10 pr-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
                  value={mediaUrl}
                  onChange={(e) => {
                    setMediaUrl(e.target.value);
                    if (e.target.value.includes('.mp4')) setMediaType('video');
                    else setMediaType('photo');
                  }}
                />
              </div>
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
