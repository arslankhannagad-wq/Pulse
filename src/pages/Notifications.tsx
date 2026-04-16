import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { useAuth } from '../App.tsx';
import { Notification as NotificationType } from '../types.ts';
import { Heart, MessageCircle, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const Notifications: React.FC = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NotificationType[];
      setNotifications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    const promises = unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true }));
    await Promise.all(promises);
  };

  if (loading) return <div className="p-4 text-center">Loading notifications...</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white border border-gray-200 md:rounded-xl overflow-hidden min-h-[500px]"
    >
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
        <h2 className="font-bold text-xl">Activity</h2>
        <button onClick={markAllAsRead} className="text-blue-500 text-sm font-bold hover:text-blue-600">Mark all as read</button>
      </div>

      <div className="flex flex-col">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Heart size={48} className="mb-4 opacity-10" />
            <p>No activity yet.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <Link to={`/p/${notif.fromUsername}`}>
                  <img src={notif.fromUserPhoto || 'https://picsum.photos/seed/user/50/50'} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                </Link>
                <div className="text-sm">
                  <span className="font-bold hover:underline cursor-pointer">
                    <Link to={`/p/${notif.fromUsername}`}>{notif.fromUsername}</Link>
                  </span>
                  <span className="text-gray-600">
                    {notif.type === 'like' && ' liked your post.'}
                    {notif.type === 'comment' && ' commented on your post.'}
                    {notif.type === 'follow' && ' started following you.'}
                  </span>
                  <span className="text-gray-400 ml-1 text-xs">{formatDistanceToNow(notif.createdAt.toDate())} ago</span>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                {notif.type === 'follow' ? (
                  <button className="bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-md hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/10">Follow Back</button>
                ) : (
                  notif.postId && (
                    <Link to={`/post/${notif.postId}`}>
                      <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200">
                        {/* Post Thumbnail would go here if we tracked it in notif */}
                      </div>
                    </Link>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default Notifications;
