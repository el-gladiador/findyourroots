export default function ProfileTab() {
  return (
    <div className="max-w-md mx-auto">
      {/* Profile Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👤</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">John Smith</h1>
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
