'use client';

import { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { Person } from '@/types/family';

interface EditPersonProps {
  person: Person;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditPerson({ person, isOpen, onClose }: EditPersonProps) {
  const { updatePerson, people } = useFamily();
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [fatherId, setFatherId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when person changes
  useEffect(() => {
    if (person) {
      setName(person.name);
      setFatherName(person.fatherName || '');
      setFatherId(person.fatherId || '');
      setSearchTerm(person.fatherName || '');
    }
  }, [person]);

  const availableFathers = people.filter(p => 
    p.id !== person.id && // Can't be father of themselves
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Find father by name if provided
      let finalFatherId = fatherId;
      let finalFatherName = fatherName;
      
      if (fatherName && !fatherId) {
        const father = people.find(p => p.name.toLowerCase() === fatherName.toLowerCase());
        if (father) {
          finalFatherId = father.id;
        }
      } else if (fatherId) {
        const father = people.find(p => p.id === fatherId);
        if (father) {
          finalFatherName = father.name;
        }
      }

      await updatePerson(person.id, {
        name: name.trim(),
        fatherName: finalFatherName || undefined,
        fatherId: finalFatherId || undefined,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update person');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFatherSelect = (selectedPerson: Person) => {
    setFatherName(selectedPerson.name);
    setFatherId(selectedPerson.id);
    setSearchTerm(selectedPerson.name);
    setShowSuggestions(false);
  };

  const clearFather = () => {
    setFatherName('');
    setFatherId('');
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            Edit Person
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter person's name"
              required
              autoFocus
            />
          </div>

          <div className="relative">
            <label htmlFor="father" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Father (optional)
            </label>
            <div className="relative">
              <input
                type="text"
                id="father"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setFatherName(e.target.value);
                  setFatherId('');
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pr-10"
                placeholder="Search for or enter father's name"
              />
              {(fatherName || searchTerm) && (
                <button
                  type="button"
                  onClick={clearFather}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {showSuggestions && searchTerm && availableFathers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {availableFathers.slice(0, 5).map((father) => (
                  <button
                    key={father.id}
                    type="button"
                    onClick={() => handleFatherSelect(father)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="font-medium">{father.name}</div>
                    {father.fatherName && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Child of {father.fatherName}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
