'use client';

import { useState } from 'react';
import AddPerson from './AddPerson';

export default function AddPersonButton() {
  const [showAddPerson, setShowAddPerson] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowAddPerson(true)}
        className="p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl text-center hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
      >
        <div className="text-3xl mb-2">👥</div>
        <div className="font-medium text-purple-900 dark:text-purple-100">Add People</div>
      </button>

      {showAddPerson && (
        <AddPerson onClose={() => setShowAddPerson(false)} />
      )}
    </>
  );
}
