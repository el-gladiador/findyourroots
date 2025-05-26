export default function SearchPage() {
  return (
    <div className="min-h-screen p-8 pb-20">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Search</h1>
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for family records..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="text-2xl mb-2">👤</div>
              <div className="text-sm font-medium">People</div>
            </button>
            <button className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="text-2xl mb-2">📍</div>
              <div className="text-sm font-medium">Places</div>
            </button>
            <button className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="text-2xl mb-2">📅</div>
              <div className="text-sm font-medium">Dates</div>
            </button>
            <button className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="text-2xl mb-2">📄</div>
              <div className="text-sm font-medium">Records</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
