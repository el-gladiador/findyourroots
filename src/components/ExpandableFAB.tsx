import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

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
  const [bottomOffset, setBottomOffset] = useState('4.5rem');

  useEffect(() => {
    const calculateBottomOffset = () => {
      // Check if we're on iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      // Check if we're on mobile
      const isMobile = window.innerWidth < 640; // sm breakpoint in Tailwind
      
      // On iOS, we need extra space for the home indicator
      // On desktop, we need less space since the bottom nav is smaller
      if (isIOS && isMobile) {
        // iOS mobile: bottom nav (72px) + safe area (34px) + padding (16px) = ~122px ≈ 7.5rem
        setBottomOffset('7.5rem');
      } else if (isMobile) {
        // Android mobile: bottom nav (72px) + padding (16px) = ~88px ≈ 5.5rem
        setBottomOffset('5.5rem');
      } else {
        // Desktop: bottom nav (72px) + padding (16px) = ~88px ≈ 5.5rem
        setBottomOffset('5.5rem');
      }
    };

    calculateBottomOffset();
    
    // Recalculate on resize
    window.addEventListener('resize', calculateBottomOffset);
    return () => window.removeEventListener('resize', calculateBottomOffset);
  }, []);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Calculate visible actions
  const visibleActions = [];
  
  // Always show add button (even for guests to show they need to sign in)
  visibleActions.push({
    id: 'add',
    icon: PlusIcon,
    action: onAddPerson,
    className: canAdd 
      ? 'bg-blue-600 hover:bg-blue-700 text-white'
      : 'bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed'
  });
  
  if (showClear && isAdmin) {
    visibleActions.push({
      id: 'clear',
      icon: TrashIcon,
      action: onClearTree,
      className: 'bg-red-600 hover:bg-red-700 text-white'
    });
  }

  // If only one action, show simple FAB
  if (visibleActions.length === 1) {
    const action = visibleActions[0];
    const Icon = action.icon;
    return (
      <div 
        className="fixed right-4 z-50"
        style={{ bottom: bottomOffset }}
      >
        <button
          onClick={() => {
            if (action.id === 'add' && !canAdd) {
              alert('Please sign in to add people to the family tree.');
              return;
            }
            action.action();
          }}
          className={`
            w-14 h-14 rounded-full shadow-lg transition-all duration-300 ease-out
            flex items-center justify-center
            ${action.className}
            hover:shadow-xl hover:scale-110
            active:scale-95
            touch-manipulation
          `}
        >
          <Icon className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className="fixed right-4 z-50"
      style={{ bottom: bottomOffset }}
    >
      {/* Action Buttons - Android-style mini FABs */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-2 mb-3">
          {visibleActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  if (action.id === 'add' && !canAdd) {
                    // Show a message to guest users
                    alert('Please sign in to add people to the family tree.');
                    return;
                  }
                  action.action();
                  setIsExpanded(false);
                }}
                className={`
                  w-10 h-10 rounded-full shadow-md transition-all duration-150 ease-out
                  flex items-center justify-center
                  ${action.className}
                  hover:shadow-lg hover:scale-105
                  active:scale-95
                  touch-manipulation
                `}
                style={{
                  opacity: 0,
                  transform: 'translateY(8px) scale(0.8)',
                  animation: `fabSlideIn 200ms ease-out forwards ${index * 30}ms`
                }}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={toggleExpanded}
        className={`
          w-14 h-14 rounded-full shadow-xl transition-all duration-200 ease-out
          flex items-center justify-center
          ${canAdd 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-gray-400 hover:bg-gray-500 text-white'
          }
          hover:shadow-2xl hover:scale-105
          active:scale-95
          touch-manipulation
          ${isExpanded ? 'rotate-45' : 'rotate-0'}
        `}
        aria-label={isExpanded ? 'Close menu' : 'Open menu'}
        aria-expanded={isExpanded}
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* Simple backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-transparent -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <style jsx>{`
        @keyframes fabSlideIn {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
