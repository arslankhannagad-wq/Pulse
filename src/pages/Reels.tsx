import React, { useEffect, useState, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { Post } from '../types.ts';
import { Heart, MessageCircle, Send, Music } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../App.tsx';

const Reels: React.FC = () => {
  const [reels, setReels] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reels are basically videos sorted by engagement or date
    const q = query(
      collection(db, 'posts'),
      where('mediaType', '==', 'video'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reelData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
      setReels(reelData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-black text-white">Loading Reels...</div>;
  }

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black" ref={scrollRef}>
      {reels.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-white text-center p-8">
          <PlaySquare size={64} className="mb-4 opacity-20" />
          <p className="text-xl font-bold">No Reels found yet</p>
          <p className="text-gray-400 mt-2">Be the first to upload a short video!</p>
        </div>
      ) : (
        reels.map((reel) => (
          <ReelItem key={reel.id} reel={reel} />
        ))
      )}
    </div>
  );
};

const ReelItem: React.FC<{ reel: Post }> = ({ reel }) => {
  const { profile } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play();
          setPlaying(true);
        } else {
          videoRef.current?.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative h-[calc(100vh-64px)] md:h-screen w-full snap-start bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={reel.mediaUrl || (reel as any).imageUrl}
        className="h-full w-full object-contain"
        loop
        muted={false} // Pulse defaults to sound for Reels for impact
        playsInline
      />
      
      {/* Bottom Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col space-y-4">
        <div className="flex items-center space-x-3">
          <img src={reel.authorPhoto} className="w-10 h-10 rounded-full border border-white" referrerPolicy="no-referrer" />
          <span className="text-white font-bold">{reel.authorUsername}</span>
          <button className="border border-white text-white text-xs font-bold px-3 py-1 rounded-md hover:bg-white/10 transition-colors">Follow</button>
        </div>
        <p className="text-white text-sm line-clamp-2">{reel.caption}</p>
        <div className="flex items-center space-x-2 text-white text-sm">
          <Music size={14} />
          <span className="truncate">Original Audio • {reel.authorUsername}</span>
        </div>
      </div>

      {/* Right Sidebar Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col space-y-6 items-center text-white">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-white/10 rounded-full backdrop-blur-md cursor-pointer hover:bg-white/20">
            <Heart size={28} />
          </div>
          <span className="text-xs mt-1 font-bold">{reel.likesCount || 0}</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="p-3 bg-white/10 rounded-full backdrop-blur-md cursor-pointer hover:bg-white/20">
            <MessageCircle size={28} />
          </div>
          <span className="text-xs mt-1 font-bold">{reel.commentsCount || 0}</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="p-3 bg-white/10 rounded-full backdrop-blur-md cursor-pointer hover:bg-white/20">
            <Send size={28} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Help for PlaySquare icon
import { PlaySquare } from 'lucide-react';

export default Reels;
