import AddPersonButton from '../AddPersonButton';

interface HomeTabProps {
  onNavigateToFamilyTree?: () => void;
}

export default function HomeTab({ onNavigateToFamilyTree }: HomeTabProps) {
  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Find Your Roots
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover your family history
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl text-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
          <div className="text-3xl mb-2">🔍</div>
          <div className="font-medium text-blue-900 dark:text-blue-100">Quick Search</div>
        </button>
        <button 
          onClick={onNavigateToFamilyTree}
          className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl text-center hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <div className="text-3xl mb-2">🌳</div>
          <div className="font-medium text-green-900 dark:text-green-100">Family Tree</div>
        </button>
        <AddPersonButton />
        <button className="p-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl text-center hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
          <div className="text-3xl mb-2">📄</div>
          <div className="font-medium text-orange-900 dark:text-orange-100">Documents</div>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <div className="text-2xl mr-3">👤</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">New ancestor found</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sarah Johnson (1845-1920)</div>
              </div>
              <div className="text-xs text-gray-500">2 days ago</div>
            </div>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📄</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">Document uploaded</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Marriage certificate</div>
              </div>
              <div className="text-xs text-gray-500">1 week ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">42</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Ancestors</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">8</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Documents</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">156</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Photos</div>
        </div>
      </div>
    </div>
  );
}
