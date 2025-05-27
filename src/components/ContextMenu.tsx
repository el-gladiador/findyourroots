'use client';

import React from 'react';
import { Person } from '@/types/family';

interface ContextMenuProps {
  person: Person;
  position: { x: number; y: number };
  onAddChild: () => void;
  onUpdate: () => void;
  onRemove: () => void;
  onClose: () => void;
  canEdit: boolean;
  canAdd: boolean;
  isAdmin: boolean;
}

export default function ContextMenu({
  person,
  position,
  onAddChild,
  onUpdate,
  onRemove,
  onClose,
  canEdit,
  canAdd,
  isAdmin
}: ContextMenuProps) {
  return (
    <>
      {/* Backdrop to close menu */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Context Menu */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -10px)'
        }}
      >
        {/* Person name header */}
        <div className="px-4 py-2 border-b border-gray-100">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {person.name}
          </p>
        </div>

        {/* Menu items */}
        <div className="py-1">
          {/* Add Child */}
          {canAdd && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddChild();
                onClose();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center space-x-3 transition-colors duration-150"
            >
              <span className="text-lg">👶</span>
              <span>Add Child</span>
            </button>
          )}

          {/* Update */}
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate();
                onClose();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-3 transition-colors duration-150"
            >
              <span className="text-lg">✏️</span>
              <span>Update</span>
            </button>
          )}

          {/* Remove */}
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
                onClose();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center space-x-3 transition-colors duration-150"
            >
              <span className="text-lg">🗑️</span>
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
