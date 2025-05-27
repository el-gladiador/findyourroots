'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from './BottomNavigation';
import HomeTab from './tabs/HomeTab';
import SearchTab from './tabs/SearchTab';
import FavoritesTab from './tabs/FavoritesTab';
import ProfileTab from './tabs/ProfileTab';

export type TabType = 'home' | 'search' | 'favorites' | 'profile';

export default function TabContainer() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { authUser, signOut, isAdmin } = useAuth();

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Handle sign in navigation - sign out guest to show login screen
  const handleSignIn = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      {/* Fixed Top Bar with User Info */}
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">🌳</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Find Your Roots</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* User Info */}
          <div className="flex items-center space-x-2">
            {authUser?.isGuest ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">👤 Guest</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 min-w-0">
                <span className="text-sm text-gray-900 dark:text-white truncate max-w-24">{authUser?.name}</span>
                {isAdmin && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-xs rounded-full text-purple-800 dark:text-purple-300 font-medium flex-shrink-0">
                    Admin
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Auth Buttons */}
          {authUser?.isGuest ? (
            <button
              onClick={handleSignIn}
              className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-medium"
              title="Sign In"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Sign In</span>
            </button>
          ) : (
            <button
              onClick={handleSignOut}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Sign Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tab Content with top margin for fixed header */}
      <div className="pt-16">
        <div className={activeTab === 'home' ? 'block' : 'hidden'}>
          <HomeTab />
        </div>
        <div className={activeTab === 'search' ? 'block p-4' : 'hidden'}>
          <SearchTab />
        </div>
        <div className={activeTab === 'favorites' ? 'block p-4' : 'hidden'}>
          <FavoritesTab />
        </div>
        <div className={activeTab === 'profile' ? 'block p-4' : 'hidden'}>
          <ProfileTab onTabChange={setActiveTab} />
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
