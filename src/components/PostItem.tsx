import React, { useState, useEffect } from 'react';
import { 
  doc, onSnapshot, setDoc, deleteDoc, collection, 
  query, orderBy, Timestamp, updateDoc, increment, getDoc, serverTimestamp
} from 'firebase/firestore';
import { Heart, MessageCircle, Send, MoreHorizontal, Trash2 } from 'lucide-react';
import { db } from '../firebase.ts';
import { Post, Comment } from '../types.ts';
import { useAuth } from '../App.tsx';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface PostItemProps {
  post: Post;
}

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const { profile } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const likeRef = doc(db, 'posts', post.id, 'likes', profile.uid);
    const unsubscribe = onSnapshot(likeRef, (doc) => {
      setIsLiked(doc.exists());
    });
    return () => unsubscribe();
  }, [post.id, profile]);

  useEffect(() => {
    const commentsRef = collection(db, 'posts', post.id, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(newComments);
    });
    return () => unsubscribe();
  }, [post.id]);

  const handleLike = async () => {
    if (!profile) return;
    const likeRef = doc(db, 'posts', post.id, 'likes', profile.uid);
    const postRef = doc(db, 'posts', post.id);

    if (isLiked) {
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likesCount: increment(-1) });
      setLikesCount(prev => Math.max(0, prev - 1));
    } else {
      await setDoc(likeRef, { userId: profile.uid, createdAt: serverTimestamp() });
      await updateDoc(postRef, { likesCount: increment(1) });
      setLikesCount(prev => prev + 1);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !commentText.trim()) return;

    const commentRef = doc(collection(db, 'posts', post.id, 'comments'));
    const postRef = doc(db, 'posts', post.id);

    try {
      await setDoc(commentRef, {
        userId: profile.uid,
        username: profile.username,
        userPhoto: profile.profilePhoto,
        text: commentText,
        createdAt: serverTimestamp(),
      });
      await updateDoc(postRef, { commentsCount: increment(1) });
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!profile || profile.uid !== post.userId) return;
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="bg-white border border-gray-200 md:rounded-lg overflow-hidden flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <Link to={`/p/${post.authorUsername}`} className="flex items-center space-x-3">
          <img
            src={post.authorPhoto || 'https://picsum.photos/seed/user/50/50'}
            alt={post.authorUsername}
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
            referrerPolicy="no-referrer"
          />
          <span className="font-semibold text-sm hover:underline">{post.authorUsername}</span>
        </Link>
        {profile?.uid === post.userId && (
          <button onClick={() => setShowDeleteConfirm(true)} className="text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {/* Media Content (Photo or Video) */}
      <div className="aspect-square bg-black flex items-center justify-center overflow-hidden relative">
        {post.mediaType === 'video' ? (
          <video
            src={post.mediaUrl || (post as any).imageUrl}
            className="w-full h-full object-contain"
            loop
            muted
            autoPlay
            playsInline
            onDoubleClick={handleLike}
          />
        ) : (
          <img
            src={post.mediaUrl || (post as any).imageUrl}
            alt={post.caption}
            className="w-full h-full object-cover"
            onDoubleClick={handleLike}
            referrerPolicy="no-referrer"
          />
        )}

        {/* Delete Confirmation Modal Overlay */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-xs w-full text-center shadow-2xl"
              >
                <Trash2 size={40} className="mx-auto text-red-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">Delete Post?</h3>
                <p className="text-gray-500 text-sm mb-6">This action cannot be undone and will remove the post from Pulse.</p>
                <div className="flex flex-col space-y-2">
                  <button 
                    onClick={handleDelete}
                    className="bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-gray-100 text-gray-800 font-bold py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center space-x-4 mb-2">
          <button onClick={handleLike} className={`${isLiked ? 'text-red-500 fill-current' : 'text-black hover:text-gray-600'} transition-all transform active:scale-125`}>
            <Heart size={28} />
          </button>
          <button onClick={() => setShowComments(!showComments)} className="text-black hover:text-gray-600">
            <MessageCircle size={28} />
          </button>
          <button className="text-black hover:text-gray-600">
            <Send size={28} />
          </button>
        </div>

        <p className="font-bold text-sm mb-1">{likesCount.toLocaleString()} likes</p>

        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-bold mr-2">{post.authorUsername}</span>
            {post.caption}
          </p>
          
          {comments.length > 0 && !showComments && (
            <button
              onClick={() => setShowComments(true)}
              className="text-gray-500 text-sm hover:text-gray-700"
            >
              View all {comments.length} comments
            </button>
          )}

          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden bg-gray-50 rounded-md p-2 mt-2 space-y-2 max-h-48 overflow-y-auto"
              >
                {comments.map((comment) => (
                  <div key={comment.id} className="text-sm">
                    <span className="font-bold mr-2">{comment.username}</span>
                    <span className="text-gray-800">{comment.text}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-gray-400 text-[10px] uppercase mt-2">
            {post.createdAt ? formatDistanceToNow(post.createdAt.toDate()) : ''} ago
          </p>
        </div>
      </div>

      {/* Comment Input */}
      <form onSubmit={handleComment} className="border-t border-gray-100 px-3 py-3 flex items-center space-x-3">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-grow text-sm focus:outline-none bg-transparent"
        />
        <button
          type="submit"
          disabled={!commentText.trim()}
          className="text-blue-500 font-bold text-sm disabled:opacity-30 transition-opacity"
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default PostItem;
