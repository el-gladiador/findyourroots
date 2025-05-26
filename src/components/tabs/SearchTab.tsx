'use client';

import { useState } from 'react';

export default function SearchTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Search</h1>
      
      {/* State persistence demo */}
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
          Demo: This state persists when you switch tabs!
        </p>
        <button 
          onClick={() => setClickCount(count => count + 1)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Clicked {clickCount} times
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for family records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
        </div>
        
        {searchQuery && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              Your search: "{searchQuery}" - This also persists across tabs!
            </p>
          </div>
        )}

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
  );
}
