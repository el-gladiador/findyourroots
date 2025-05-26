export default function FavoritesPage() {
  const favorites = [
    { id: 1, name: "John Smith", relation: "Great Grandfather", year: "1875-1942" },
    { id: 2, name: "Mary Johnson", relation: "Great Grandmother", year: "1880-1955" },
    { id: 3, name: "Immigration Record", relation: "Ellis Island", year: "1903" },
  ];

  return (
    <div className="min-h-screen p-8 pb-20">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Favorites</h1>
        
        {favorites.length > 0 ? (
          <div className="space-y-4">
            {favorites.map((item) => (
              <div 
                key={item.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.relation}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{item.year}</p>
                  </div>
                  <button className="text-red-500 hover:text-red-700 ml-4">
                    ❤️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💫</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No favorites yet</h3>
            <p className="text-gray-600 dark:text-gray-400">Start exploring your family history and save your discoveries here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
