'use client';

import { TabType } from '../TabContainer';
import { useState, useEffect } from 'react';

interface ProfileTabProps {
  onTabChange?: (tab: TabType) => void;
}

export default function ProfileTab({ }: ProfileTabProps) {
  const [appVersion, setAppVersion] = useState('1.0.3'); // Default fallback version

  useEffect(() => {
    // Get version from service worker
    const getVersionFromSW = () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ action: 'GET_VERSION' });
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SW_VERSION_INFO') {
        setAppVersion(event.data.version);
      }
    };

    // Add message listener
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      // Try to get version immediately if SW is ready
      getVersionFromSW();
      
      // Also try when service worker becomes ready
      navigator.serviceWorker.ready.then(() => {
        getVersionFromSW();
      });
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
    };
  }, []);
  return (
    <div className="max-w-md mx-auto">
      {/* Author Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl text-white">ZA</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Zaki Amiri
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Creator & Developer • Heritage Technology Specialist
          </p>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-5 mt-5">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Our Mission</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-left">
              Find Your Roots was created with a profound appreciation for the stories that shape us. Every family has a unique 
              narrative filled with love, courage, and triumph—stories that deserve to be treasured and shared across generations.
            </p>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-left">
              This platform was thoughtfully designed to bridge the past with the future, using modern technology to honor 
              ancestral wisdom while making family heritage accessible, beautiful, and meaningful for every generation to come.
            </p>
          </div>
        </div>
      </div>
      
      {/* Core Values & Features */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Why Families Love Us</h3>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="text-emerald-600 dark:text-emerald-400 mr-3">🌳</div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Stunning Family Visualization</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Watch your family history come alive through our elegant, interactive tree that beautifully reveals the connections that bind generations together
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="text-rose-600 dark:text-rose-400 mr-3">💝</div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Treasured Stories & Memories</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Safeguard the precious moments, cherished traditions, and heartfelt stories that make your family&apos;s journey truly extraordinary
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="text-amber-600 dark:text-amber-400 mr-3">🔐</div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Fortress-Level Security</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your family&apos;s most precious stories are protected with military-grade encryption and privacy safeguards that honor the trust you place in us
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="text-violet-600 dark:text-violet-400 mr-3">✨</div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Effortless & Delightful</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Experience the joy of exploring your heritage through our thoughtfully crafted interface that works seamlessly on every device, anytime, anywhere
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Connect With Us */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Let&apos;s Connect & Share Stories</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
          We&apos;d be honored to hear about your family&apos;s journey and how we can make this experience even more meaningful for you
        </p>
        <div className="flex items-center justify-center space-x-6">
          <a href="https://github.com/el-gladiador" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="GitHub">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" clipRule="evenodd"></path>
            </svg>
          </a>
          <a href="mailto:zaki.jsx@gmail.com" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Email">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Version Info */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-xs text-gray-500 dark:text-gray-600">
          Find Your Roots v{appVersion}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-600">
          Lovingly crafted with 💝 to celebrate families and preserve their timeless legacy
        </p>
      </div>
    </div>
  );
}
