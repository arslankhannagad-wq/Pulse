import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { Post as PostType } from '../types.ts';
import { useAuth } from '../App.tsx';
import PostItem from '../components/PostItem.tsx';
import Stories from '../components/Stories.tsx';
import { motion } from 'motion/react';

const Home: React.FC = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  useEffect(() => {
    if (!profile) return;

    // Fetch following list
    const fetchFollowing = async () => {
      const followingRef = collection(db, 'users', profile.uid, 'following');
      const snapshot = await getDocs(followingRef);
      const ids = snapshot.docs.map(doc => doc.id);
      setFollowingIds(ids);
    };

    fetchFollowing();
  }, [profile]);

  useEffect(() => {
    if (!profile) return;

    // Default: show latest posts (Discover)
    // In a real app, you'd filter by followingIds if not empty
    let q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    // Simple logic for MVP: Show feed from everyone
    // If you want strictly following:
    /*
    if (followingIds.length > 0) {
      q = query(
        collection(db, 'posts'),
        where('userId', 'in', [...followingIds, profile.uid]),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
    }
    */

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PostType[];
      setPosts(newPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile, followingIds]);

  if (loading) {
    return (
      <div className="flex flex-col space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex flex-col space-y-3 bg-white border border-gray-200 p-4 md:rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="aspect-square bg-gray-200 rounded"></div>
            <div className="w-full h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col space-y-6"
    >
      <Stories />
      
      {posts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-500 text-lg">No posts yet. Be the first!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))
      )}
    </motion.div>
  );
};

export default Home;
