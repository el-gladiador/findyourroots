'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TabType } from '../TabContainer';

interface ProfileTabProps {
  onTabChange?: (tab: TabType) => void;
}

export default function ProfileTab({ onTabChange }: ProfileTabProps = {}) {
  const { authUser, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setError(error.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };
  
  // If user is a guest, show sign-in options
  if (authUser?.isGuest) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl text-white">🌳</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Sign in to unlock all features
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Continue with Google to edit the family tree
            </p>
            
            {error && (
              <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
            
            {/* Cancel Button */}
            <button
              onClick={() => onTabChange && onTabChange('home')}
              className="w-full mt-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              Cancel and Continue as Guest
            </button>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-left">
              <div className="flex items-start">
                <div className="text-blue-600 dark:text-blue-400 mr-3 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-blue-800 dark:text-blue-400">
                    Currently in <strong>view-only</strong> mode. Sign in to add or edit family members.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Profile Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👤</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{authUser?.name || 'User'}</h1>
        <p className="text-gray-600 dark:text-gray-400">Family Historian since 2023</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">147</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Ancestors</div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">23</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Documents</div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">89</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Photos</div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        <button className="w-full flex items-center p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <div className="text-xl mr-4">🌳</div>
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white">Family Tree</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">View your complete family tree</div>
          </div>
          <div className="text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button className="w-full flex items-center p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <div className="text-xl mr-4">📊</div>
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white">DNA Results</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">View your ethnicity breakdown</div>
          </div>
          <div className="text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button className="w-full flex items-center p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <div className="text-xl mr-4">⚙️</div>
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white">Settings</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Privacy, notifications, and more</div>
          </div>
          <div className="text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button className="w-full flex items-center p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <div className="text-xl mr-4">💡</div>
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white">Hints & Tips</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Learn research techniques</div>
          </div>
          <div className="text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button className="w-full flex items-center p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <div className="text-xl mr-4">📞</div>
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white">Support</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Get help with your research</div>
          </div>
          <div className="text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Version Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-600">
          Find Your Roots v1.0.0
        </p>
      </div>
    </div>
  );
}
