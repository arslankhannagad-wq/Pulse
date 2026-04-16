import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { Post as PostType } from '../types.ts';
import PostItem from '../components/PostItem.tsx';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!postId) return;
    const postRef = doc(db, 'posts', postId);
    const unsubscribe = onSnapshot(postRef, (docSnap) => {
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() } as PostType);
      } else {
        setPost(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [postId]);

  if (loading) return null;

  if (!post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Post Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-blue-500 mt-4">Go back</button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col"
    >
      <div className="flex items-center space-x-4 mb-4 md:hidden">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft size={24} />
        </button>
        <span className="font-bold">Post</span>
      </div>
      <PostItem post={post} />
    </motion.div>
  );
};

export default PostDetail;
