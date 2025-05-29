'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { Person } from '@/types/family';
import EditPerson from './EditPerson';
import ContextMenu from './ContextMenu';
import { ExpandableFAB } from './ExpandableFAB';

interface FamilyTreeProps {
  onAddPerson?: (parentId?: string) => void;
}

interface TreeNode {
  person: Person;
  children: TreeNode[];
  level: number;
  x: number;
  y: number;
}

interface PersonCardProps {
  node: TreeNode;
  CARD_HEIGHT: number;
  onMoreClick: (person: Person, event: React.MouseEvent) => void;
  isGuest?: boolean;
}

function PersonCard({ node, CARD_HEIGHT, onMoreClick, isGuest = false }: PersonCardProps) {
  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoreClick(node.person, e);
  };

  // Fixed card width - simpler approach
  const cardWidth = 200; // Fixed width for all cards
  
  // Simple text truncation helper
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  };

  const truncatedName = truncateText(node.person.name, 18);
  const truncatedFatherName = node.person.fatherName ? 
    truncateText(`Father: ${node.person.fatherName}`, 20) : "";

  return (
    <g data-person-card="true">
      {/* Card Shadow */}
      <rect
        x={node.x - cardWidth / 2 + 2}
        y={node.y + 2}
        width={cardWidth}
        height={CARD_HEIGHT}
        rx="12"
        fill="rgba(0, 0, 0, 0.1)"
        className="transition-all duration-300"
      />
      
      {/* Card Background */}
      <rect
        x={node.x - cardWidth / 2}
        y={node.y}
        width={cardWidth}
        height={CARD_HEIGHT}
        rx="12"
        fill="url(#cardGradient)"
        stroke="rgb(229, 231, 235)"
        strokeWidth="1"
        className="hover:stroke-blue-400 hover:stroke-2 transition-all duration-300 transform hover:scale-105"
        style={{ 
          transformOrigin: `${node.x}px ${node.y + CARD_HEIGHT/2}px`,
        }}
      />
      
      {/* Profile Image Background */}
      <circle
        cx={node.x}
        cy={node.y + 25}
        r="18"
        fill="url(#profileGradient)"
      />
      
      {/* Profile Image Circle */}
      <circle
        cx={node.x}
        cy={node.y + 25}
        r="15"
        fill="rgb(243, 244, 246)"
        stroke="white"
        strokeWidth="2"
      />
      
      {/* Person Icon */}
      <text
        x={node.x}
        y={node.y + 30}
        textAnchor="middle"
        fontSize="14"
        fill="rgb(59, 130, 246)"
      >
        👤
      </text>

      {/* Name - Below icon, centered */}
      <text
        x={node.x}
        y={node.y + 55}
        textAnchor="middle"
        fontSize="16"
        fontWeight="600"
        fill="rgb(17, 24, 39)"
        filter={isGuest ? "url(#nameBlur)" : undefined}
      >
        {truncatedName}
      </text>

      {/* Father Name - Below name, centered */}
      {node.person.fatherName && (
        <text
          x={node.x}
          y={node.y + 75}
          textAnchor="middle"
          fontSize="12"
          fill="rgb(107, 114, 128)"
          filter={isGuest ? "url(#nameBlur)" : undefined}
        >
          {truncatedFatherName}
        </text>
      )}

      {/* Date Added - At bottom, centered */}
      <text
        x={node.x}
        y={node.y + 95}
        textAnchor="middle"
        fontSize="10"
        fill="rgb(107, 114, 128)"
      >
        Added: {new Date(node.person.createdAt).toLocaleDateString()}
      </text>

      {/* More Button - Top right corner */}
      <g className="cursor-pointer" onClick={handleMoreClick}>
        <circle
          cx={node.x + cardWidth / 2 - 20}
          cy={node.y + 15}
          r="12"
          fill="rgba(107, 114, 128, 0.1)"
          className="hover:fill-blue-100 transition-colors duration-200"
        />
        <text
          x={node.x + cardWidth / 2 - 20}
          y={node.y + 20}
          textAnchor="middle"
          fontSize="14"
          fill="rgb(107, 114, 128)"
          className="hover:fill-blue-600 transition-colors duration-200"
        >
          ⋯
        </text>
      </g>
    </g>
  );
}

export default function EnhancedFamilyTree({ onAddPerson }: FamilyTreeProps) {
  const { people, clearTree, loading, error, removePerson } = useFamily();
  const { authUser, isAdmin } = useAuth();
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [isTouching, setIsTouching] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    person: Person;
    position: { x: number; y: number };
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Card dimensions - responsive
  const [dimensions, setDimensions] = useState({
    CARD_WIDTH: 200, // Fixed width for all cards
    CARD_HEIGHT: 120,
    LEVEL_HEIGHT: 200,
    SIBLING_SPACING: 240 // Adjusted spacing for fixed width cards
  });

  // Update dimensions based on window size
  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768;
      setDimensions({
        CARD_WIDTH: 200, // Keep fixed width on all devices
        CARD_HEIGHT: isMobile ? 100 : 120,
        LEVEL_HEIGHT: isMobile ? 160 : 200,
        SIBLING_SPACING: isMobile ? 220 : 240 // Adjusted for fixed width
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

  // Handle more button click on person cards - disabled for guests
  const handleMoreClick = useCallback((person: Person, event: React.MouseEvent) => {
    // Disable context menu for guest users
    if (authUser?.isGuest) return;
    
    // Get the position for the context menu
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setContextMenu({
      person,
      position: {
        x: event.clientX,
        y: event.clientY
      }
    });
  }, [authUser]);

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

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

  // Zoom and pan handlers with improved responsiveness - limited to 10%-100% and disabled for guests
  const handleZoomIn = () => {
    if (authUser?.isGuest) return;
    setZoomLevel(prev => Math.min(prev * 1.3, 1.0)); // Max 100%
  };
  const handleZoomOut = () => {
    if (authUser?.isGuest) return;
    setZoomLevel(prev => Math.max(prev / 1.3, 0.1)); // Min 10%
  };
  const handleResetView = () => {
    if (authUser?.isGuest) return;
    const { zoom, panX, panY } = calculateOptimalView();
    setZoomLevel(zoom);
    setPanOffset({ x: panX, y: panY });
  };

  // Mouse/touch handlers for panning - disabled for guests
  const handleMouseDown = (e: React.MouseEvent) => {
    // Disable interactions for guest users
    if (authUser?.isGuest) return;
    
    // Don't handle mouse events if currently touching (prevents conflicts on touch devices)
    if (isTouching) return;
    
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Disable interactions for guest users
    if (authUser?.isGuest) return;
    
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
    // Disable interactions for guest users
    if (authUser?.isGuest) return;
    
    // Don't handle mouse events if currently touching
    if (isTouching) return;
    
    setIsDragging(false);
  };

  // Helper function to check if touch is on a PersonCard
  const isTouchOnPersonCard = (touch: React.Touch): boolean => {
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return false;
    
    // Check if the element or any of its parents has the person card attribute
    let current = element as Element;
    while (current && current !== document.body) {
      if (current.closest('[data-person-card="true"]')) {
        return true;
      }
      current = current.parentElement as Element;
    }
    return false;
  };

  // Touch handlers for mobile support with improved responsiveness - disabled for guests
  const handleTouchStart = (e: React.TouchEvent) => {
    // Disable interactions for guest users
    if (authUser?.isGuest) return;
    
    const touches = e.touches;
    setIsTouching(true);
    
    if (touches.length === 1) {
      // Single touch - prepare for potential dragging
      setDragStart({ 
        x: touches[0].clientX - panOffset.x, 
        y: touches[0].clientY - panOffset.y 
      });
      
      // Check if touch is on a PersonCard
      const isOnPersonCard = isTouchOnPersonCard(touches[0]);
      
      if (!isOnPersonCard) {
        // Single touch on background - immediately enable pan and prevent default
        e.preventDefault();
        setIsDragging(true);
      }
      // If on PersonCard, don't prevent default or set dragging yet - 
      // let the movement detection in handleTouchMove determine if it's a drag
    } else if (touches.length === 2) {
      // Two fingers - pinch to zoom (always prevent default for zoom)
      e.preventDefault();
      const distance = Math.sqrt(
        Math.pow(touches[0].clientX - touches[1].clientX, 2) +
        Math.pow(touches[0].clientY - touches[1].clientY, 2)
      );
      setLastTouchDistance(distance);
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Disable interactions for guest users
    if (authUser?.isGuest) return;
    
    const touches = e.touches;
    
    if (touches.length === 1) {
      // Calculate movement distance from start
      const deltaX = Math.abs(touches[0].clientX - (dragStart.x + panOffset.x));
      const deltaY = Math.abs(touches[0].clientY - (dragStart.y + panOffset.y));
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // If user has moved beyond a small threshold, start dragging
      // This allows dragging to work even when starting on a PersonCard
      if (distance > 5 && !isDragging) { // Reduced threshold for better responsiveness
        e.preventDefault();
        setIsDragging(true);
      }
      
      // Continue panning if we're dragging
      if (isDragging) {
        e.preventDefault();
        setPanOffset({
          x: touches[0].clientX - dragStart.x,
          y: touches[0].clientY - dragStart.y,
        });
      }
    } else if (touches.length === 2 && lastTouchDistance > 0) {
      // Two fingers - pinch to zoom with center point calculation
      e.preventDefault();
      
      const touch1 = touches[0];
      const touch2 = touches[1];
      
      const distance = Math.sqrt(
        Math.pow(touch1.clientX - touch2.clientX, 2) +
        Math.pow(touch1.clientY - touch2.clientY, 2)
      );
      
      // Calculate the center point between the two touches
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      // Get container bounds for relative positioning
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const relativeCenterX = centerX - rect.left;
        const relativeCenterY = centerY - rect.top;
        
        const scale = distance / lastTouchDistance;
        const newZoom = Math.min(Math.max(zoomLevel * scale, 0.1), 1.0); // 10% to 100%
        
        // Calculate the point in tree coordinates that should remain stationary
        const treePointX = (relativeCenterX - panOffset.x) / zoomLevel;
        const treePointY = (relativeCenterY - panOffset.y) / zoomLevel;
        
        // Calculate new pan offset to keep that point under the center of the pinch
        const newPanX = relativeCenterX - (treePointX * newZoom);
        const newPanY = relativeCenterY - (treePointY * newZoom);
        
        setZoomLevel(newZoom);
        setPanOffset({ x: newPanX, y: newPanY });
        setLastTouchDistance(distance);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Disable interactions for guest users
    if (authUser?.isGuest) return;
    
    // Only prevent default if we were actually dragging
    if (isDragging) {
      e.preventDefault();
    }
    setIsDragging(false);
    setIsTouching(false);
    setLastTouchDistance(0);
  };

  // Wheel zoom with mouse-centered zooming - disabled for guests
  const handleWheel = (e: React.WheelEvent) => {
    // Disable interactions for guest users
    if (authUser?.isGuest) return;
    
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      // Get mouse position relative to container
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate zoom direction and amount
        const zoomDirection = e.deltaY < 0 ? 1.3 : 1/1.3; // Increased zoom step
        const newZoom = Math.min(Math.max(zoomLevel * zoomDirection, 0.1), 1.0); // 10% to 100%
        
        // Calculate the point in tree coordinates that should remain stationary
        const treePointX = (mouseX - panOffset.x) / zoomLevel;
        const treePointY = (mouseY - panOffset.y) / zoomLevel;
        
        // Calculate new pan offset to keep that point under the mouse
        const newPanX = mouseX - (treePointX * newZoom);
        const newPanY = mouseY - (treePointY * newZoom);
        
        setZoomLevel(newZoom);
        setPanOffset({ x: newPanX, y: newPanY });
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

  // Calculate optimal zoom and position for all nodes
  const calculateOptimalView = useCallback(() => {
    if (allNodes.length === 0 || !containerRef.current) {
      return { zoom: 1, panX: 0, panY: 0 };
    }

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate bounds of all nodes in tree coordinate system
    const minX = Math.min(...allNodes.map(n => n.x)) - CARD_WIDTH / 2;
    const maxX = Math.max(...allNodes.map(n => n.x)) + CARD_WIDTH / 2;
    const minY = Math.min(...allNodes.map(n => n.y));
    const maxY = Math.max(...allNodes.map(n => n.y)) + CARD_HEIGHT;

    const treeWidth = maxX - minX;
    const treeHeight = maxY - minY;

    // Add padding (10% of viewport size)
    const padding = Math.min(containerWidth, containerHeight) * 0.1;
    const availableWidth = containerWidth - (padding * 2);
    const availableHeight = containerHeight - (padding * 2);

    // Calculate zoom to fit all nodes with padding
    const scaleX = availableWidth / treeWidth;
    const scaleY = availableHeight / treeHeight;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.1), 1.0); // 10% to 100%

    // Calculate center point of the tree in tree coordinate system
    const treeCenterX = (minX + maxX) / 2;
    const treeCenterY = (minY + maxY) / 2;

    // Calculate pan offset to center the tree in viewport
    const newPanX = (containerWidth / 2) - (treeCenterX * newZoom);
    const newPanY = (containerHeight / 2) - (treeCenterY * newZoom);

    return { zoom: newZoom, panX: newPanX, panY: newPanY };
  }, [allNodes, CARD_WIDTH, CARD_HEIGHT]);

  // Initialize with optimal view on first load only
  const [hasInitialized, setHasInitialized] = useState(false);
  useEffect(() => {
    if (allNodes.length > 0 && containerRef.current && !hasInitialized) {
      // Use the same logic as handleResetView for initial positioning
      const { zoom, panX, panY } = calculateOptimalView();
      setZoomLevel(zoom);
      setPanOffset({ x: panX, y: panY });
      setHasInitialized(true);
    }
  }, [allNodes, calculateOptimalView, hasInitialized]);

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
            onClick={() => onAddPerson && onAddPerson()}
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

  // Only allow edits and adds for admin users
  const canEdit = isAdmin;
  const canAdd = isAdmin; // Only admin can add people

  // Context menu handlers
  const handleContextMenuAction = {
    addChild: (person: Person) => {
      if (onAddPerson) {
        onAddPerson(person.id);
      }
    },
    update: (person: Person) => {
      setEditingPerson(person);
    },
    remove: async (person: Person) => {
      if (window.confirm(`Are you sure you want to remove ${person.name} from the family tree?`)) {
        try {
          await removePerson(person.id);
        } catch (error) {
          console.error('Failed to remove person:', error);
          alert('Failed to remove person. Please try again.');
        }
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Controls - Fixed positioning with top bar padding - Hidden for guests */}
      {!authUser?.isGuest && (
        <div className="fixed top-18 left-2 sm:top-20 sm:left-4 z-30 flex flex-col gap-1 sm:gap-2">
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
              className="p-2 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
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
      </div>
      )}

      {/* Instructions - Fixed positioning with top bar padding */}
      {/* <div className="fixed top-18 right-2 sm:top-20 sm:right-4 z-30 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 sm:p-3 max-w-[200px] sm:max-w-xs">
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <strong>Navigation:</strong><br />
          • <span className="hidden sm:inline">Drag to pan</span><span className="sm:hidden">Touch & drag</span><br />
          • <span className="hidden sm:inline">Ctrl+Scroll to zoom</span><span className="sm:hidden">Pinch to zoom</span><br />
          • Click &ldquo;⋯&rdquo; button for options
        </p>
      </div> */}

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
          cursor: authUser?.isGuest ? 'default' : (isDragging ? 'grabbing' : 'grab'),
          touchAction: authUser?.isGuest ? 'auto' : 'none' // Prevent default touch behaviors for non-guests
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="overflow-visible"
          style={{ display: 'block' }}
        >
          {/* SVG Definitions */}
          <defs>
            {/* Blur filter for guest users */}
            <filter id="nameBlur">
              <feGaussianBlur stdDeviation="4"/>
            </filter>
            
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

          {/* Transform group for all tree content */}
          <g
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: '0 0',
              transition: isDragging || isTouching ? 'none' : 'transform 0.2s ease-out', // Faster transition
            }}
          >
            {/* Connections */}
            <g>{generateConnections()}</g>

            {/* Person Cards */}
            {allNodes.map((node) => (
              <PersonCard key={node.person.id} node={node} CARD_HEIGHT={CARD_HEIGHT} onMoreClick={handleMoreClick} isGuest={authUser?.isGuest} />
            ))}
          </g>
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

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          person={contextMenu.person}
          position={contextMenu.position}
          onAddChild={() => handleContextMenuAction.addChild(contextMenu.person)}
          onUpdate={() => handleContextMenuAction.update(contextMenu.person)}
          onRemove={() => handleContextMenuAction.remove(contextMenu.person)}
          onClose={closeContextMenu}
          canEdit={canEdit}
          canAdd={canAdd}
          isAdmin={isAdmin}
        />
      )}

      {/* Expandable FAB */}
      <ExpandableFAB
        onAddPerson={() => onAddPerson && onAddPerson()}
        onClearTree={() => setShowClearConfirm(true)}
        canAdd={canAdd}
        isAdmin={isAdmin}
        showClear={people.length > 0}
      />


    </div>
  );
}
