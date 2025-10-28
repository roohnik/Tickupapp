import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';

interface UserProfileProps {
  currentUser: User;
  onLogout: () => void;
  onEditProfile: () => void;
  isCollapsed?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ currentUser, onLogout, onEditProfile, isCollapsed = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        title={currentUser.name}
        className={`flex items-center focus:outline-none p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors`}
      >
        <img
          className="h-8 w-8 rounded-full"
          src={currentUser.avatarUrl}
          alt={currentUser.name}
        />
      </button>
      {isMenuOpen && (
        <div className="origin-bottom-right absolute right-0 bottom-full mb-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50 animate-fade-in">
          <button
            onClick={() => { onEditProfile(); setIsMenuOpen(false); }}
            className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ویرایش پروفایل
          </button>
          <button
            onClick={onLogout}
            className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            خروج
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
