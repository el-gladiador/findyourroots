'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { Person } from '@/types/family';
import EditPerson from './EditPerson';

interface FamilyTreeProps {
  onAddPerson?: () => void;
}

interface TreeNode {
  person: Person;
  children: TreeNode[];
  level: number;
  x: number;
  y: number;
}

export default function EnhancedFamilyTree({ onAddPerson }: FamilyTreeProps) {
  const { people, clearTree, loading, error } = useFamily();
  const { authUser, isAdmin } = useAuth();
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [isTouching, setIsTouching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Card dimensions - responsive
  const [dimensions, setDimensions] = useState({
    CARD_WIDTH: 280,
    CARD_HEIGHT: 120,
    LEVEL_HEIGHT: 200,
    SIBLING_SPACING: 320
  });

  // Update dimensions based on window size
  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768;
      setDimensions({
        CARD_WIDTH: isMobile ? 240 : 280,
        CARD_HEIGHT: isMobile ? 100 : 120,
        LEVEL_HEIGHT: isMobile ? 160 : 200,
        SIBLING_SPACING: isMobile ? 260 : 320
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { CARD_WIDTH, CARD_HEIGHT, LEVEL_HEIGHT, SIBLING_SPACING } = dimensions;

  // Build tree structure
  const buildTree = useCallback((): TreeNode[] => {
    if (people.length === 0) return [];

    // Find root people (those without fathers)
    const rootPeople = people.filter(person => !person.fatherId);
    
    const buildNodeTree = (person: Person, level: number = 0): TreeNode => {
      const children = people
        .filter(p => p.fatherId === person.id)
        .map(child => buildNodeTree(child, level + 1));

      return {
        person,
        children,
        level,
        x: 0,
        y: level * LEVEL_HEIGHT,
      };
    };

    return rootPeople.map(person => buildNodeTree(person));
  }, [people, LEVEL_HEIGHT]);

  // Calculate positions for tree nodes
  const calculatePositions = (nodes: TreeNode[]): TreeNode[] => {
    let currentX = 0;

    const positionNode = (node: TreeNode): TreeNode => {
      if (node.children.length === 0) {
        // Leaf node
        const positioned = { ...node, x: currentX };
        currentX += SIBLING_SPACING;
        return positioned;
      }

      // Position children first
      const positionedChildren = node.children.map(positionNode);
      
      // Position parent at center of children
      const leftmostChild = positionedChildren[0];
      const rightmostChild = positionedChildren[positionedChildren.length - 1];
      const centerX = (leftmostChild.x + rightmostChild.x) / 2;

      return {
        ...node,
        x: centerX,
        children: positionedChildren,
      };
    };

    return nodes.map(positionNode);
  };

  // Get all nodes in flat array
  const getAllNodes = (nodes: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = [];
    
    const traverse = (node: TreeNode) => {
      result.push(node);
      node.children.forEach(traverse);
    };

    nodes.forEach(traverse);
    return result;
  };

  const treeNodes = calculatePositions(buildTree());
  const allNodes = getAllNodes(treeNodes);

  // Zoom and pan handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.2, 0.3));
  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Mouse/touch handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't handle mouse events if currently touching (prevents conflicts on touch devices)
    if (isTouching) return;
    
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Don't handle mouse events if currently touching
    if (isTouching) return;
    
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    // Don't handle mouse events if currently touching
    if (isTouching) return;
    
    setIsDragging(false);
  };

  // Touch handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touches = e.touches;
    setIsTouching(true);
    
    if (touches.length === 1) {
      // Single touch - pan
      setIsDragging(true);
      setDragStart({ 
        x: touches[0].clientX - panOffset.x, 
        y: touches[0].clientY - panOffset.y 
      });
    } else if (touches.length === 2) {
      // Two fingers - pinch to zoom
      const distance = Math.sqrt(
        Math.pow(touches[0].clientX - touches[1].clientX, 2) +
        Math.pow(touches[0].clientY - touches[1].clientY, 2)
      );
      setLastTouchDistance(distance);
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touches = e.touches;
    
    if (touches.length === 1 && isDragging) {
      // Single touch - pan
      setPanOffset({
        x: touches[0].clientX - dragStart.x,
        y: touches[0].clientY - dragStart.y,
      });
    } else if (touches.length === 2 && lastTouchDistance > 0) {
      // Two fingers - pinch to zoom
      const distance = Math.sqrt(
        Math.pow(touches[0].clientX - touches[1].clientX, 2) +
        Math.pow(touches[0].clientY - touches[1].clientY, 2)
      );
      
      const scale = distance / lastTouchDistance;
      const newZoom = Math.min(Math.max(zoomLevel * scale, 0.3), 3);
      setZoomLevel(newZoom);
      setLastTouchDistance(distance);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setIsTouching(false);
    setLastTouchDistance(0);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  };

  // Generate SVG paths for connections with smooth curves
  const generateConnections = (): React.ReactElement[] => {
    const connections: React.ReactElement[] = [];

    allNodes.forEach((node) => {
      node.children.forEach((child) => {
        const startX = node.x;
        const startY = node.y + CARD_HEIGHT;
        const endX = child.x;
        const endY = child.y;

        const controlPoint1Y = startY + 30;
        const controlPoint2Y = endY - 30;

        // Create smooth curved path
        const pathData = `M ${startX} ${startY} 
                         C ${startX} ${controlPoint1Y}, 
                           ${endX} ${controlPoint2Y}, 
                           ${endX} ${endY}`;

        connections.push(
          <g key={`${node.person.id}-${child.person.id}`}>
            {/* Connection shadow */}
            <path
              d={pathData}
              stroke="rgba(0, 0, 0, 0.1)"
              strokeWidth="3"
              fill="none"
              transform="translate(1, 1)"
            />
            {/* Main connection line */}
            <path
              d={pathData}
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              fill="none"
              className="transition-all duration-300 hover:stroke-blue-600 hover:stroke-[3px]"
            />
          </g>
        );
      });
    });

    return connections;
  };

  // Calculate SVG dimensions and centering
  const getSvgDimensions = () => {
    if (allNodes.length === 0) return { width: 800, height: 600, centerX: 400, centerY: 300 };

    const minX = Math.min(...allNodes.map(n => n.x)) - CARD_WIDTH / 2;
    const maxX = Math.max(...allNodes.map(n => n.x)) + CARD_WIDTH / 2;
    const minY = Math.min(...allNodes.map(n => n.y));
    const maxY = Math.max(...allNodes.map(n => n.y)) + CARD_HEIGHT;

    const width = Math.max(maxX - minX + 400, 1200);
    const height = Math.max(maxY - minY + 400, 800);
    
    // Calculate center point for initial view
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return { width, height, centerX, centerY };
  };

  const svgDims = getSvgDimensions();

  // Center the view on first load
  useEffect(() => {
    if (allNodes.length > 0 && containerRef.current) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Center the tree in the viewport
      const initialPanX = (containerWidth / 2) - svgDims.centerX;
      const initialPanY = (containerHeight / 2) - svgDims.centerY;
      
      setPanOffset({ x: initialPanX, y: initialPanY });
    }
  }, [allNodes.length, svgDims.centerX, svgDims.centerY]);

  if (people.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Start Your Family Tree
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            Begin building your family tree by adding your first family member. 
            You can add parents, children, and other relatives.
          </p>
          <button
            onClick={onAddPerson}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Add First Person
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading family tree...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load family tree
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Only allow edits for admin users
  const canEdit = isAdmin;
  const canAdd = !authUser?.isGuest; // Allow authenticated users to add, but only admin can edit/delete

  return (
    <div className="relative w-full h-full">
      {/* Controls - Mobile optimized */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 flex flex-col gap-1 sm:gap-2">
        {/* Zoom Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 sm:p-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors touch-manipulation"
              title="Zoom Out"
            >
              <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <span className="text-xs sm:text-sm font-medium min-w-[40px] sm:min-w-[50px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors touch-manipulation"
              title="Zoom In"
            >
              <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
            <button
              onClick={handleResetView}
              className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors touch-manipulation"
              title="Reset View"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-1 sm:gap-2">
          {canAdd && (
            <button
              onClick={onAddPerson}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base touch-manipulation"
            >
              <span className="hidden sm:inline">Add Person</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
          {people.length > 0 && isAdmin && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm sm:text-base touch-manipulation"
            >
              <span className="hidden sm:inline">Clear Tree</span>
              <span className="sm:hidden">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Instructions - Mobile optimized */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 sm:p-3 max-w-[200px] sm:max-w-xs">
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <strong>Navigation:</strong><br />
          • <span className="hidden sm:inline">Drag to pan</span><span className="sm:hidden">Touch & drag</span><br />
          • <span className="hidden sm:inline">Ctrl+Scroll to zoom</span><span className="sm:hidden">Pinch to zoom</span><br />
          • Tap card to edit
        </p>
      </div>

      {/* Main Tree Area */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 cursor-grab touch-pan-x touch-pan-y"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none' // Prevent default touch behaviors
        }}
      >
        <svg
          ref={svgRef}
          width={svgDims.width}
          height={svgDims.height}
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.3s ease',
          }}
          className="overflow-visible"
        >
          {/* SVG Definitions */}
          <defs>
            {/* Gradient for cards */}
            <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'rgb(249, 250, 251)', stopOpacity: 1 }} />
            </linearGradient>
            
            {/* Profile gradient */}
            <linearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'rgb(37, 99, 235)', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* Connections */}
          <g>{generateConnections()}</g>

          {/* Person Cards */}
          {allNodes.map((node) => (
            <g key={node.person.id}>
              {/* Card Shadow */}
              <rect
                x={node.x - CARD_WIDTH / 2 + 2}
                y={node.y + 2}
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                rx="12"
                fill="rgba(0, 0, 0, 0.1)"
                className="transition-all duration-300"
              />
              
              {/* Card Background */}
              <rect
                x={node.x - CARD_WIDTH / 2}
                y={node.y}
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                rx="12"
                fill="url(#cardGradient)"
                stroke="rgb(229, 231, 235)"
                strokeWidth="1"
                className="hover:stroke-blue-400 hover:stroke-2 transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => canEdit && setEditingPerson(node.person)}
                style={{ transformOrigin: `${node.x}px ${node.y + CARD_HEIGHT/2}px` }}
              />
              
              {/* Profile Image Background */}
              <circle
                cx={node.x - CARD_WIDTH / 2 + 40}
                cy={node.y + 40}
                r="28"
                fill="url(#profileGradient)"
                className="cursor-pointer"
                onClick={() => canEdit && setEditingPerson(node.person)}
              />
              
              {/* Profile Image Circle */}
              <circle
                cx={node.x - CARD_WIDTH / 2 + 40}
                cy={node.y + 40}
                r="25"
                fill="rgb(243, 244, 246)"
                stroke="white"
                strokeWidth="3"
                className="cursor-pointer"
                onClick={() => canEdit && setEditingPerson(node.person)}
              />
              
              {/* Person Icon */}
              <text
                x={node.x - CARD_WIDTH / 2 + 40}
                y={node.y + 47}
                textAnchor="middle"
                fontSize="20"
                fill="rgb(59, 130, 246)"
                className="cursor-pointer"
                onClick={() => canEdit && setEditingPerson(node.person)}
              >
                👤
              </text>

              {/* Name */}
              <text
                x={node.x - CARD_WIDTH / 2 + 80}
                y={node.y + 30}
                fontSize="16"
                fontWeight="600"
                fill="rgb(17, 24, 39)"
                className="cursor-pointer"
                onClick={() => canEdit && setEditingPerson(node.person)}
              >
                {node.person.name}
              </text>

              {/* Father Name */}
              {node.person.fatherName && (
                <text
                  x={node.x - CARD_WIDTH / 2 + 80}
                  y={node.y + 50}
                  fontSize="14"
                  fill="rgb(107, 114, 128)"
                  className="cursor-pointer"
                  onClick={() => canEdit && setEditingPerson(node.person)}
                >
                  Father: {node.person.fatherName}
                </text>
              )}

              {/* Date Added */}
              <text
                x={node.x - CARD_WIDTH / 2 + 80}
                y={node.y + 70}
                fontSize="12"
                fill="rgb(107, 114, 128)"
                className="cursor-pointer"
                onClick={() => canEdit && setEditingPerson(node.person)}
              >
                Added: {new Date(node.person.createdAt).toLocaleDateString()}
              </text>

              {/* Hover Edit Button */}
              {canEdit && (
                <g className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <circle
                    cx={node.x + CARD_WIDTH / 2 - 25}
                    cy={node.y + 25}
                    r="15"
                    fill="rgb(59, 130, 246)"
                    className="cursor-pointer drop-shadow-md"
                    onClick={() => setEditingPerson(node.person)}
                  />
                  <text
                    x={node.x + CARD_WIDTH / 2 - 25}
                    y={node.y + 29}
                    textAnchor="middle"
                    fontSize="10"
                    fill="white"
                    className="cursor-pointer"
                    onClick={() => setEditingPerson(node.person)}
                  >
                    ✏️
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Clear Family Tree
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to clear the entire family tree? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await clearTree();
                    setShowClearConfirm(false);
                  } catch (err) {
                    console.error('Failed to clear tree:', err);
                    // You could add error handling here if needed
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Person Modal */}
      {editingPerson && (
        <EditPerson
          person={editingPerson}
          isOpen={true}
          onClose={() => setEditingPerson(null)}
        />
      )}
    </div>
  );
}
