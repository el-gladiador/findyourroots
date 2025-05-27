'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedFamilyTree from '@/components/EnhancedFamilyTree';
import AddPerson from '@/components/AddPerson';

interface FamilyTreeTabProps {
  onBack: () => void;
}

export default function FamilyTreeTab({ onBack }: FamilyTreeTabProps) {
  const { authUser } = useAuth();
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(undefined);
  
  // Check if user can add people (not guest)
  const canAdd = !authUser?.isGuest;

  const handleAddPerson = (parentId?: string) => {
    setSelectedParentId(parentId);
    setShowAddPerson(true);
  };

  const handleCloseAddPerson = () => {
    setShowAddPerson(false);
    setSelectedParentId(undefined);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header - Compact */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Family Tree</h1>
        </div>
      </div>

      {/* Content - Full Height */}
      <div className="flex-1 overflow-hidden">
        <EnhancedFamilyTree onAddPerson={canAdd ? handleAddPerson : undefined} />
      </div>

      {/* Add Person Modal */}
      {showAddPerson && canAdd && (
        <AddPerson onClose={handleCloseAddPerson} parentId={selectedParentId} />
      )}
    </div>
  );
}
