'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedFamilyTree from '@/components/EnhancedFamilyTree';
import AddPerson from '@/components/AddPerson';

export default function HomeTab() {
  const { authUser } = useAuth();
  const [showAddPerson, setShowAddPerson] = useState(false);
  
  // Check if user can add people (not guest)
  const canAdd = !authUser?.isGuest;

  return (
    <div className="h-[calc(100vh-136px)] bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Family Tree - Full Height */}
      <div className="flex-1 overflow-hidden">
        <EnhancedFamilyTree onAddPerson={canAdd ? () => setShowAddPerson(true) : undefined} />
      </div>

      {/* Add Person Modal */}
      {showAddPerson && canAdd && (
        <AddPerson onClose={() => setShowAddPerson(false)} />
      )}
    </div>
  );
}
