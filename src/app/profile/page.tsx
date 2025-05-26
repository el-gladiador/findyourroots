export default function ProfilePage() {
  return (
    <div className="min-h-screen p-8 pb-20">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Profile</h1>
        
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
            👤
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Welcome back!</h2>
          <p className="text-gray-600 dark:text-gray-400">Family History Explorer</p>
        </div>

        {/* Menu Items */}
        <div className="space-y-4">
          <button className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center">
              <span className="text-2xl mr-4">🌳</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Family Tree</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">View your genealogy</div>
              </div>
            </div>
          </button>

          <button className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center">
              <span className="text-2xl mr-4">⚙️</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Settings</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">App preferences</div>
              </div>
            </div>
          </button>

          <button className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center">
              <span className="text-2xl mr-4">📊</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Statistics</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Research progress</div>
              </div>
            </div>
          </button>

          <button className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center">
              <span className="text-2xl mr-4">ℹ️</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">About</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">App information</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
