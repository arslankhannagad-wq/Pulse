import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  collection, query, where, orderBy, onSnapshot, doc, getDoc, 
  setDoc, deleteDoc, updateDoc, increment, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase.ts';
import { UserProfile, Post } from '../types.ts';
import { useAuth } from '../App.tsx';
import { Settings, Grid, Bookmark, Users, Heart, MessageCircle, PlaySquare } from 'lucide-react';
import { motion } from 'motion/react';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { profile: loggedInProfile } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'posts' | 'reels'>('posts');

  useEffect(() => {
    // Fetch user profile by username
    const q = query(collection(db, 'users'), where('username', '==', username?.toLowerCase()));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data() as UserProfile;
        setUserProfile({ uid: snapshot.docs[0].id, ...data });
        setFollowerCount(data.followersCount || 0);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [username]);

  useEffect(() => {
    if (!userProfile) return;

    // Fetch user's posts
    const q = query(
      collection(db, 'posts'),
      where('userId', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const uPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(uPosts);
    });

    return () => unsubscribe();
  }, [userProfile]);

  useEffect(() => {
    if (!loggedInProfile || !userProfile || loggedInProfile.uid === userProfile.uid) return;

    // Check if following
    const followRef = doc(db, 'users', loggedInProfile.uid, 'following', userProfile.uid);
    const unsubscribe = onSnapshot(followRef, (doc) => {
      setIsFollowing(doc.exists());
    });
    return () => unsubscribe();
  }, [loggedInProfile, userProfile]);

  const toggleFollow = async () => {
    if (!loggedInProfile || !userProfile) return;

    const followingRef = doc(db, 'users', loggedInProfile.uid, 'following', userProfile.uid);
    const followerRef = doc(db, 'users', userProfile.uid, 'followers', loggedInProfile.uid);
    const loggedInUserRef = doc(db, 'users', loggedInProfile.uid);
    const targetUserRef = doc(db, 'users', userProfile.uid);

    if (isFollowing) {
      // Unfollow
      await deleteDoc(followingRef);
      await deleteDoc(followerRef);
      await updateDoc(loggedInUserRef, { followingCount: increment(-1) });
      await updateDoc(targetUserRef, { followersCount: increment(-1) });
      setFollowerCount(prev => Math.max(0, prev - 1));
    } else {
      // Follow
      const followData = {
        followerId: loggedInProfile.uid,
        followingId: userProfile.uid,
        createdAt: serverTimestamp(),
      };
      await setDoc(followingRef, followData);
      await setDoc(followerRef, followData);
      await updateDoc(loggedInUserRef, { followingCount: increment(1) });
      await updateDoc(targetUserRef, { followersCount: increment(1) });
      setFollowerCount(prev => prev + 1);
    }
  };

  if (loading) return null;

  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold">User Not Found</h2>
        <Link to="/" className="text-blue-500 mt-4">Go back home</Link>
      </div>
    );
  }

  const isOwnProfile = loggedInProfile?.uid === userProfile.uid;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-10"
    >
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-12 mb-10 px-4">
        <div className="mb-6 md:mb-0">
          <img
            src={userProfile.profilePhoto || 'https://picsum.photos/seed/user/150/150'}
            alt={userProfile.username}
            className="w-32 h-32 md:w-36 md:h-36 rounded-full border border-gray-200 object-cover p-1 ring-2 ring-gray-100"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex flex-col items-center md:items-start space-y-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-light">{userProfile.username}</h1>
            {isOwnProfile ? (
              <div className="flex space-x-2">
                <Link to="/edit-profile" className="bg-gray-100 hover:bg-gray-200 font-semibold px-4 py-1.5 rounded transition-colors text-sm">
                  Edit Profile
                </Link>
                <Settings size={28} className="p-1 cursor-pointer" />
              </div>
            ) : (
              <button
                onClick={toggleFollow}
                className={`${
                  isFollowing ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'
                } font-semibold px-6 py-1.5 rounded transition-colors text-sm`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <div className="flex space-x-8">
            <div><span className="font-bold">{posts.length}</span> posts</div>
            <div><span className="font-bold">{followerCount}</span> followers</div>
            <div><span className="font-bold">{userProfile.followingCount || 0}</span> following</div>
          </div>

          <div className="text-center md:text-left">
            <p className="font-bold">{userProfile.displayName}</p>
            <p className="whitespace-pre-wrap text-sm">{userProfile.bio}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-gray-200">
        <div className="flex justify-center space-x-12 -mt-px">
          <div 
            onClick={() => setActiveTab('posts')}
            className={`${activeTab === 'posts' ? 'border-t border-black text-black' : 'text-gray-400'} pt-4 flex items-center space-x-2 cursor-pointer uppercase text-xs font-semibold tracking-widest transition-colors hover:text-gray-600`}
          >
            <Grid size={16} />
            <span>Posts</span>
          </div>
          <div 
            onClick={() => setActiveTab('reels')}
            className={`${activeTab === 'reels' ? 'border-t border-black text-black' : 'text-gray-400'} pt-4 flex items-center space-x-2 cursor-pointer uppercase text-xs font-semibold tracking-widest transition-colors hover:text-gray-600`}
          >
            <PlaySquare size={16} />
            <span>Reels</span>
          </div>
          <div className="pt-4 flex items-center space-x-2 cursor-pointer text-gray-400 uppercase text-xs font-semibold tracking-widest hover:text-gray-600">
            <Bookmark size={16} />
            <span>Saved</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-4 mt-8 px-1 md:px-0">
        {posts
          .filter(post => activeTab === 'reels' ? post.mediaType === 'video' : true)
          .map((post) => (
            <Link
              to={`/post/${post.id}`}
              key={post.id}
              className="aspect-square relative group overflow-hidden bg-gray-100"
            >
              {post.mediaType === 'video' ? (
                <div className="w-full h-full relative">
                  <video src={post.mediaUrl} className="w-full h-full object-cover" muted playsInline />
                  <div className="absolute top-2 right-2 text-white">
                     <PlaySquare size={16} />
                  </div>
                </div>
              ) : (
                <img
                  src={post.mediaUrl}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white space-x-4">
              <div className="flex items-center space-x-1 font-bold">
                <Heart size={20} fill="white" />
                <span>{post.likesCount || 0}</span>
              </div>
              <div className="flex items-center space-x-1 font-bold">
                <MessageCircle size={20} fill="white" />
                <span>{post.commentsCount || 0}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default Profile;
