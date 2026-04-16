import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { useAuth } from '../App.tsx';
import { Conversation, Message } from '../types.ts';
import { Send, Image as ImageIcon, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const Messages: React.FC = () => {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', profile.uid),
      orderBy('lastUpdatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Conversation[];
      setConversations(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  useEffect(() => {
    if (!activeConv) return;

    const q = query(
      collection(db, 'conversations', activeConv.id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
      setMessages(data);
    });

    return () => unsubscribe();
  }, [activeConv]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !activeConv || !newMessage.trim()) return;

    const msgText = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'conversations', activeConv.id, 'messages'), {
        senderId: profile.uid,
        text: msgText,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'conversations', activeConv.id), {
        lastMessage: msgText,
        lastUpdatedAt: serverTimestamp()
      });
    } catch (err) {
       console.error(err);
    }
  };

  if (!profile) return null;

  return (
    <div className="bg-white border border-gray-200 md:rounded-xl overflow-hidden h-[calc(100vh-140px)] md:h-[600px] flex shadow-sm">
      {/* Sidebar - Conversation List */}
      <div className={`w-full md:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col ${activeConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-xl">{profile.username}</h2>
          <Search size={20} className="text-gray-400 cursor-pointer" />
        </div>
        <div className="overflow-y-auto flex-grow">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No messages yet. Search for people to chat!</div>
          ) : (
            conversations.map(conv => {
              const otherIndex = conv.participantIds.indexOf(profile.uid) === 0 ? 1 : 0;
              const otherUsername = conv.participantUsernames[otherIndex];
              const otherPhoto = conv.participantPhotos[otherIndex];

              return (
                <div 
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`flex items-center space-x-3 p-4 cursor-pointer transition-colors hover:bg-gray-50 ${activeConv?.id === conv.id ? 'bg-blue-50/50 hover:bg-blue-50' : ''}`}
                >
                  <img src={otherPhoto} className="w-12 h-12 rounded-full object-cover ring-1 ring-gray-100" referrerPolicy="no-referrer" />
                  <div className="flex-grow overflow-hidden">
                    <p className="font-medium text-sm truncate">{otherUsername}</p>
                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage || 'Sent an attachment'}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-grow flex flex-col bg-gray-50 ${!activeConv ? 'hidden md:flex items-center justify-center text-center' : 'flex'}`}>
        {!activeConv ? (
          <div className="p-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-2 border-gray-200 flex items-center justify-center mb-6">
              <Send size={48} className="text-gray-200 -rotate-12" />
            </div>
            <h3 className="text-xl font-bold mb-2">Your Messages</h3>
            <p className="text-gray-500 text-sm">Send private photos and messages to a friend.</p>
            <button className="mt-6 bg-blue-500 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">Send Message</button>
          </div>
        ) : (
          <>
            <div className="p-4 bg-white border-b border-gray-200 flex items-center space-x-3 sticky top-0 z-10">
              <button onClick={() => setActiveConv(null)} className="md:hidden text-gray-400 mr-2">
                <Search size={20} className="rotate-180" />
              </button>
              {/* Other User Info */}
              <div className="flex items-center space-x-3">
                 <img src={activeConv.participantPhotos[activeConv.participantIds.indexOf(profile.uid) === 0 ? 1 : 0]} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                 <span className="font-bold">{activeConv.participantUsernames[activeConv.participantIds.indexOf(profile.uid) === 0 ? 1 : 0]}</span>
              </div>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto flex flex-col space-y-4">
              {messages.map((msg, i) => {
                const isMine = msg.senderId === profile.uid;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${isMine ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                      {msg.text}
                      <p className={`text-[9px] mt-1 ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                        {formatDistanceToNow(msg.createdAt.toDate())} ago
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex items-center space-x-3">
              <button type="button" className="text-gray-400 hover:text-black transition-colors"><ImageIcon size={24} /></button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message..."
                className="flex-grow bg-gray-100 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-200"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="text-blue-500 font-bold text-sm disabled:opacity-30 hover:text-blue-600 transition-colors"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;
