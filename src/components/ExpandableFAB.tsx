import React, { useState } from 'react';
import { PlusIcon, TrashIcon, UserPlusIcon } from '@heroicons/react/24/outline';

interface ExpandableFABProps {
  onAddPerson: () => void;
  onClearTree: () => void;
  canAdd: boolean;
  isAdmin: boolean;
  showClear: boolean;
}

export const ExpandableFAB: React.FC<ExpandableFABProps> = ({
  onAddPerson,
  onClearTree,
  canAdd,
  isAdmin,
  showClear
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Calculate visible actions
  const visibleActions = [];
  
  // Always show add button (even for guests to show they need to sign in)
  if (canAdd || !canAdd) { // Show for everyone but with different behavior
    visibleActions.push({
      id: 'add',
      icon: UserPlusIcon,
      label: 'Add Person',
      action: onAddPerson,
      enabled: canAdd,
      description: canAdd ? 'Add a new family member' : 'Admin access required to add people'
    });
  }
  
  if (showClear && isAdmin) {
    visibleActions.push({
      id: 'clear',
      icon: TrashIcon,
      label: 'Clear Tree',
      action: onClearTree,
      enabled: true,
      description: 'Remove all family members'
    });
  }

  // If only one action and it's enabled, show simple FAB
  if (visibleActions.length === 1 && visibleActions[0].enabled) {
    const action = visibleActions[0];
    const Icon = action.icon;
    return (
      <div 
        className="fixed right-4 z-50 fab-bottom"
      >
        <button
          onClick={action.action}
          className="
            h-14 px-6 rounded-full shadow-lg transition-all duration-300 ease-out
            flex items-center justify-center gap-3
            bg-blue-600 hover:bg-blue-700 text-white
            hover:shadow-xl hover:scale-105
            active:scale-95
            touch-manipulation
            min-w-14
          "
          aria-label={action.label}
        >
          <Icon className="w-6 h-6" />
          <span className="font-medium text-sm hidden sm:block">{action.label}</span>
        </button>
      </div>
    );
  }

  return (
    <div 
      className="fixed right-4 z-50 fab-bottom"
    >
      {/* Extended Menu - appears above FAB */}
      {isExpanded && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Menu Container */}
          <div 
            className="absolute bottom-20 right-0 mb-2"
            style={{
              opacity: 0,
              transform: 'translateY(8px) scale(0.95)',
              animation: 'menuSlideIn 200ms ease-out forwards'
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[200px]">
              {/* Menu Header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  Family Tree Actions
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                {visibleActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        if (!action.enabled && action.id === 'add') {
                          alert('Only admin users can add people to the family tree. Please sign in with an admin account.');
                          return;
                        }
                        action.action();
                        setIsExpanded(false);
                      }}
                      disabled={!action.enabled}
                      className={`
                        w-full text-left px-4 py-3 text-sm flex items-center space-x-3 transition-all duration-150
                        ${action.enabled 
                          ? action.id === 'add' 
                            ? 'text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400'
                          : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${action.enabled
                          ? action.id === 'add'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                        }
                      `}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{action.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {action.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Extended FAB Button */}
      <button
        onClick={toggleExpanded}
        className={`
          h-14 px-6 rounded-full shadow-xl transition-all duration-300 ease-out
          flex items-center justify-center gap-3
          bg-blue-600 hover:bg-blue-700 text-white
          hover:shadow-2xl hover:scale-105
          active:scale-95
          touch-manipulation
          min-w-14
          ${isExpanded ? 'shadow-2xl' : ''}
        `}
        aria-label={isExpanded ? 'Close menu' : 'Open menu'}
        aria-expanded={isExpanded}
      >
        <PlusIcon className={`w-6 h-6 transition-transform duration-200 ${isExpanded ? 'rotate-45' : 'rotate-0'}`} />
        <span className="font-medium text-sm hidden sm:block">
          {isExpanded ? 'Close' : 'Actions'}
        </span>
      </button>

      <style jsx>{`
        @keyframes menuSlideIn {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
