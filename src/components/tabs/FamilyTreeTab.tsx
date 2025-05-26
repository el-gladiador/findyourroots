'use client';

import { useState } from 'react';
import FamilyTree from '@/components/FamilyTree';
import AddPerson from '@/components/AddPerson';

interface FamilyTreeTabProps {
  onBack: () => void;
}

export default function FamilyTreeTab({ onBack }: FamilyTreeTabProps) {
  const [showAddPerson, setShowAddPerson] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
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

      {/* Content */}
      <div className="p-4">
        <FamilyTree onAddPerson={() => setShowAddPerson(true)} />
      </div>

      {/* Add Person Modal */}
      {showAddPerson && (
        <AddPerson onClose={() => setShowAddPerson(false)} />
      )}
    </div>
  );
}
