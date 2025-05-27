'use client';

import { useState, useMemo } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { Person } from '@/types/family';

export default function SearchTab() {
  const { people, getPerson } = useFamily();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // Search logic - filter people based on name or father's name
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return people.filter(person => 
      person.name.toLowerCase().includes(query) ||
      (person.fatherName && person.fatherName.toLowerCase().includes(query))
    );
  }, [people, searchQuery]);

  // Handle person selection
  const handlePersonClick = (person: Person) => {
    setSelectedPerson(person);
  };

  // Handle back to search results
  const handleBack = () => {
    setSelectedPerson(null);
  };

  // Get person's children
  const getPersonChildren = (personId: string) => {
    return people.filter(person => person.fatherId === personId);
  };

  // Get person's father
  const getPersonFather = (person: Person) => {
    return person.fatherId ? getPerson(person.fatherId) : null;
  };

  // Detailed person view
  if (selectedPerson) {
    const father = getPersonFather(selectedPerson);
    const children = getPersonChildren(selectedPerson.id);

    return (
      <div className="max-w-md mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="mr-3 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Person Details</h1>
        </div>

        {/* Person Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">👤</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {selectedPerson.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Added on {selectedPerson.createdAt.toLocaleDateString()}
            </p>
          </div>

          {/* Family Information */}
          <div className="space-y-4">
            {father && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Father</h3>
                <button
                  onClick={() => handlePersonClick(father)}
                  className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-gray-900 dark:text-white">{father.name}</span>
                </button>
              </div>
            )}

            {children.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Children ({children.length})
                </h3>
                <div className="space-y-2">
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => handlePersonClick(child)}
                      className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-gray-900 dark:text-white">{child.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!father && children.length === 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
                  No family connections recorded
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main search view
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        Search Family Tree
      </h1>
      
      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="space-y-3">
          {searchResults.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Search Results
                </h2>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {searchResults.length} found
                </span>
              </div>
              
              {searchResults.map((person) => {
                const father = getPersonFather(person);
                const childrenCount = getPersonChildren(person.id).length;
                
                return (
                  <button
                    key={person.id}
                    onClick={() => handlePersonClick(person)}
                    className="w-full text-left p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {person.name}
                        </h3>
                        {father && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Father: {father.name}
                          </p>
                        )}
                        {childrenCount > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {childrenCount} child{childrenCount > 1 ? 'ren' : ''}
                          </p>
                        )}
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-600 dark:text-gray-400">
                No results found for &quot;{searchQuery}&quot;
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Try searching by first name or father&apos;s name
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!searchQuery.trim() && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌳</div>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Search Your Family Tree
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Find family members by name
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 Tip: You can search by first names or father&apos;s names
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
