import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, startAt, endAt, orderBy } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { UserProfile } from '../types.ts';
import { Search as SearchIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'users'),
          where('username', '>=', searchTerm.toLowerCase()),
          where('username', '<=', searchTerm.toLowerCase() + '\uf8ff'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[];
        setResults(users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white border border-gray-200 md:rounded-lg overflow-hidden min-h-[500px]"
    >
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="bg-gray-100 flex items-center px-4 py-2 rounded-lg">
          <SearchIcon className="text-gray-400 mr-2" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            className="bg-transparent w-full focus:outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="bg-gray-300 rounded-full p-0.5 ml-2">
              <X size={14} className="text-white" />
            </button>
          )}
        </div>
      </div>

      <div className="p-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col">
            {results.map((user) => (
              <Link
                key={user.uid}
                to={`/p/${user.username}`}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors rounded-lg"
              >
                <img
                  src={user.profilePhoto || 'https://picsum.photos/seed/user/50/50'}
                  alt={user.username}
                  className="w-12 h-12 rounded-full border border-gray-200 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{user.username}</span>
                  <span className="text-gray-500 text-sm">{user.displayName}</span>
                </div>
              </Link>
            ))}
            {!loading && searchTerm && results.length === 0 && (
              <p className="text-center text-gray-500 py-10">No users found.</p>
            )}
            {!searchTerm && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <SearchIcon size={48} className="mb-4 opacity-20" />
                <p>Search for friends by username</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Search;
