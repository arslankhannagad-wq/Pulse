import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, PlusSquare, User, LogOut, MessageCircle, Heart, PlaySquare } from 'lucide-react';
import { auth } from '../firebase.ts';
import { useAuth } from '../App.tsx';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { profile } = useAuth();

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white md:bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 p-6">
        <div className="mb-10 px-2 font-serif text-3xl font-bold tracking-tight text-blue-600">Pulse</div>
        <nav className="flex flex-col space-y-2 flex-grow">
          <NavItem to="/" icon={<Home />} label="Home" />
          <NavItem to="/search" icon={<Search />} label="Explore" />
          <NavItem to="/reels" icon={<PlaySquare />} label="Reels" />
          <NavItem to="/messages" icon={<MessageCircle />} label="Messages" />
          <NavItem to="/notifications" icon={<Heart />} label="Activity" />
          <NavItem to="/upload" icon={<PlusSquare />} label="Create" />
          <NavItem to={profile ? `/p/${profile.username}` : '#'} icon={<User />} label="Profile" />
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-4 p-3 hover:bg-gray-100 rounded-lg transition-colors text-red-500"
        >
          <LogOut size={24} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow md:ml-64 pb-16 md:pb-0">
        <div className="max-w-2xl mx-auto w-full md:py-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-4 z-50">
        <MobileNavItem to="/" icon={<Home />} />
        <MobileNavItem to="/search" icon={<Search />} />
        <MobileNavItem to="/upload" icon={<PlusSquare />} />
        <MobileNavItem to="/reels" icon={<PlaySquare />} />
        <MobileNavItem to={profile ? `/p/${profile.username}` : '#'} icon={<User />} />
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center space-x-4 p-3 rounded-lg transition-colors ${
        isActive ? 'font-bold bg-gray-50' : 'hover:bg-gray-100'
      }`
    }
  >
    {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    <span className="text-lg">{label}</span>
  </NavLink>
);

const MobileNavItem = ({ to, icon }: { to: string; icon: React.ReactNode }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `p-2 transition-colors ${isActive ? 'text-black' : 'text-gray-400'}`
    }
  >
    {React.cloneElement(icon as React.ReactElement, { size: 28 })}
  </NavLink>
);

export default Layout;
