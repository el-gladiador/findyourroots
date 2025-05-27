'use client';

import { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';

interface AddPersonProps {
  onClose: () => void;
}

export default function AddPerson({ onClose }: AddPersonProps) {
  const { addPerson, people } = useFamily();
  const { authUser } = useAuth();
  
  // Check if user can add people (not guest)
  const canAdd = !authUser?.isGuest;

  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    fatherId: '',
  });
  const [showFatherSearch, setShowFatherSearch] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !canAdd) return;

    setIsLoading(true);
    setError(null);

    try {
      await addPerson({
        name: formData.name.trim(),
        fatherName: formData.fatherName.trim() || undefined,
        fatherId: formData.fatherId || undefined,
      });

      setFormData({ name: '', fatherName: '', fatherId: '' });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add person');
    } finally {
      setIsLoading(false);
    }
  };

  const selectFather = (person: { id: string; name: string }) => {
    setFormData(prev => ({
      ...prev,
      fatherId: person.id,
      fatherName: person.name,
    }));
    setShowFatherSearch(false);
  };

  const filteredFathers = people.filter(person =>
    person.name.toLowerCase().includes(formData.fatherName.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Person</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!canAdd && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Guest users cannot add people to the family tree. Please sign in to add family members.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter person's name"
              required
              disabled={!canAdd}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Father's Name (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, fatherName: e.target.value, fatherId: '' }));
                  setShowFatherSearch(e.target.value.length > 0);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter father's name"
                disabled={!canAdd}
              />
              
              {showFatherSearch && filteredFathers.length > 0 && canAdd && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md mt-1 max-h-32 overflow-y-auto z-10">
                  {filteredFathers.slice(0, 5).map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => selectFather(person)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                    >
                      {person.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {formData.fatherId && (
              <div className="mt-1 text-sm text-green-600 dark:text-green-400">
                ✓ Father selected from existing people
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
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || isLoading || !canAdd}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Adding...' : 'Add Person'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
