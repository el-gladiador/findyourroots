export default function FavoritesTab() {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Favorites</h1>
      
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💫</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No favorites yet</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Start exploring and add items to your favorites to see them here
        </p>
      </div>
    </div>
  );
}
