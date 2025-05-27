'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedFamilyTree from '@/components/EnhancedFamilyTree';
import AddPerson from '@/components/AddPerson';

export default function HomeTab() {
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
    <div className="h-[calc(100vh-136px)] bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Family Tree - Full Height */}
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
