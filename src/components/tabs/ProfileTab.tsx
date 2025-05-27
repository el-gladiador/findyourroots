'use client';

import { TabType } from '../TabContainer';

interface ProfileTabProps {
  onTabChange?: (tab: TabType) => void;
}

export default function ProfileTab({ }: ProfileTabProps = {}) {
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
            Software Engineer at University of Augsburg
          </p>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-5 mt-5">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">About This Project</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-left">
              &quot;Find Your Roots&quot; was created to preserve family heritage and make it accessible to future generations. 
              This passion project helps document family connections, stories, and history in an intuitive way.
            </p>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-left">
              As someone deeply interested in genealogy and family history, I built this app to help bridge the gap between generations and keep our stories alive.
            </p>
          </div>
        </div>
      </div>
      
      {/* App Features */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Features</h3>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="text-blue-600 dark:text-blue-400 mr-3">🌳</div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Interactive Family Tree</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Visualize family connections across generations
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="text-green-600 dark:text-green-400 mr-3">👤</div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Detailed Profiles</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Record life details, stories, and connections
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="text-purple-600 dark:text-purple-400 mr-3">🔒</div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Secure Access</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Secure data persistence for safe family data management
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact</h3>
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
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-600">
          Find Your Roots v1.0.0
          Created with ❤️ for our heritage preservation
        </p>
      </div>
    </div>
  );
}
