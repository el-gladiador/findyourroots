'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { FamilyNode, Person } from '@/types/family';
import EditPerson from './EditPerson';

interface FamilyTreeProps {
  onAddPerson: () => void;
}

export default function FamilyTree({ onAddPerson }: FamilyTreeProps) {
  const { getFamilyTree, people, clearTree } = useFamily();
  const familyTree = getFamilyTree();
  const [zoomLevel, setZoomLevel] = useState(0.5); // Default to 50%
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch handling for pinch-to-zoom
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.1));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(0.5); // Reset to 50% instead of 100%
  }, []);

  const handleClearTree = () => {
    clearTree();
    setShowClearConfirm(false);
  };

  // Touch distance calculation for pinch-to-zoom
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setLastTouchDistance(getTouchDistance(e.touches));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / lastTouchDistance;
      
      if (scale > 1.05) {
        handleZoomIn();
        setLastTouchDistance(currentDistance);
      } else if (scale < 0.95) {
        handleZoomOut();
        setLastTouchDistance(currentDistance);
      }
    }
  };

  const handleTouchEnd = () => {
    setLastTouchDistance(null);
  };

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          handleResetZoom();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleResetZoom]);

  if (people.length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌳</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your Family Tree
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start building your family tree by adding people
          </p>
          <button
            onClick={onAddPerson}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add First Person
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 px-2 sm:px-4 gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Family Tree</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {people.length} {people.length === 1 ? 'person' : 'people'} in your tree
          </p>
          {people.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Use Ctrl + scroll, pinch-to-zoom, or zoom controls • Zoom: {Math.round(zoomLevel * 100)}% (10%-300%)
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Zoom controls */}
          <div className="flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-sm">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 transition-colors"
              title="Zoom Out (Ctrl + -)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center font-medium">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 transition-colors"
              title="Zoom In (Ctrl + +)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <button
              onClick={handleResetZoom}
              className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 transition-colors"
              title="Reset Zoom (Ctrl + 0)"
            >
              Reset
            </button>
          </div>
          
          <div className="flex space-x-2">
            {people.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex-1 sm:flex-none px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                title="Clear entire family tree"
              >
                <span className="sm:hidden">Clear</span>
                <span className="hidden sm:inline">Clear Tree</span>
              </button>
            )}
            
            <button
              onClick={onAddPerson}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add Person</span>
            </button>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="overflow-auto h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        onWheel={(e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.deltaY < 0) {
              handleZoomIn();
            } else {
              handleZoomOut();
            }
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-x pan-y' }}
      >
        <div 
          className="flex flex-col items-center justify-center space-y-20 min-w-fit min-h-full p-6 sm:p-12 transition-transform duration-200"
          style={{ 
            transform: `scale(${zoomLevel})`, 
            transformOrigin: 'center center',
            minHeight: `${100 / zoomLevel}%`,
            minWidth: `${100 / zoomLevel}%`
          }}
        >
          {familyTree.map((root, index) => (
            <div key={`${root.person.id}-${index}`} className="flex flex-col items-center">
              <TreeNode 
                node={root} 
                level={0} 
                onEdit={setEditingPerson}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Clear Tree Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
                Clear Family Tree
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center mb-6">
                Are you sure you want to delete the entire family tree? This action cannot be undone and will remove all {people.length} {people.length === 1 ? 'person' : 'people'}.
              </p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearTree}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Clear Tree
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Person Modal */}
      {editingPerson && (
        <EditPerson
          person={editingPerson}
          isOpen={!!editingPerson}
          onClose={() => setEditingPerson(null)}
        />
      )}
    </div>
  );
}

interface TreeNodeProps {
  node: FamilyNode;
  level: number;
  onEdit: (person: Person) => void;
}

function TreeNode({ node, level, onEdit }: TreeNodeProps) {
  const { person, children } = node;
  const { removePerson } = useFamily();
  const hasChildren = children.length > 0;
  const [showActions, setShowActions] = useState(false);

  const handleRemovePerson = (personToRemove: Person) => {
    if (window.confirm(`Are you sure you want to remove ${personToRemove.name} from the family tree?`)) {
      removePerson(personToRemove.id);
    }
  };

  return (
    <div className="flex flex-col items-center relative">
      {/* Person card */}
      <div 
        className="relative z-10"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onTouchStart={() => setShowActions(true)}
        onTouchEnd={() => setTimeout(() => setShowActions(false), 3000)} // Auto-hide after 3s on mobile
      >
        <div className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-3 sm:p-4 shadow-lg min-w-[160px] sm:min-w-[200px] text-center hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="text-2xl sm:text-3xl mb-2">👤</div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg mb-1 break-words">
            {person.name}
          </h3>
          {person.fatherName && (
            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium break-words">
              Child of {person.fatherName}
            </p>
          )}
        </div>
        
        {/* Action buttons */}
        {showActions && (
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex space-x-1">
            <button
              onClick={() => onEdit(person)}
              className="p-1 sm:p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
              title="Edit person"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => handleRemovePerson(person)}
              className="p-1 sm:p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
              title="Remove person"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Children section with SVG connections */}
      {hasChildren && (
        <div className="mt-12 sm:mt-16 relative">
          {/* SVG for refined connection lines */}
          <svg 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12 sm:-translate-y-16"
            width={Math.max(children.length * 224 + 32, 200)} // Adjusted for mobile: 180px + 44px gap
            height="80"
            style={{ overflow: 'visible' }}
          >
            {(() => {
              const nodeSpacing = 224; // 180px mobile node width + 44px gap (space-x-11)
              const totalWidth = Math.max(children.length * nodeSpacing, 200);
              const centerX = totalWidth / 2;
              
              if (children.length === 1) {
                // Single child - direct vertical line
                return (
                  <>
                    <line
                      x1={centerX}
                      y1="0"
                      x2={centerX}
                      y2="80"
                      stroke="rgb(96 165 250)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </>
                );
              } else {
                // Multiple children
                const firstChildX = centerX - ((children.length - 1) * nodeSpacing) / 2;
                const lastChildX = centerX + ((children.length - 1) * nodeSpacing) / 2;
                
                return (
                  <>
                    {/* Vertical line from parent */}
                    <line
                      x1={centerX}
                      y1="0"
                      x2={centerX}
                      y2="40"
                      stroke="rgb(96 165 250)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    
                    {/* Horizontal connector line */}
                    <line
                      x1={firstChildX}
                      y1="40"
                      x2={lastChildX}
                      y2="40"
                      stroke="rgb(96 165 250)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    
                    {/* Vertical lines to children */}
                    {children.map((_, index) => (
                      <line
                        key={index}
                        x1={firstChildX + index * nodeSpacing}
                        y1="40"
                        x2={firstChildX + index * nodeSpacing}
                        y2="80"
                        stroke="rgb(96 165 250)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    ))}
                  </>
                );
              }
            })()}
          </svg>
          
          {/* Children nodes */}
          <div className="flex items-start justify-center space-x-11 sm:space-x-16">
            {children.map((child) => (
              <div key={child.person.id} className="flex flex-col items-center">
                <TreeNode node={child} level={level + 1} onEdit={onEdit} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
