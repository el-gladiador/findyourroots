'use client';

import { useState } from 'react';
import BottomNavigation from './BottomNavigation';
import HomeTab from './tabs/HomeTab';
import SearchTab from './tabs/SearchTab';
import FavoritesTab from './tabs/FavoritesTab';
import ProfileTab from './tabs/ProfileTab';
import FamilyTreeTab from './tabs/FamilyTreeTab';

export type TabType = 'home' | 'search' | 'favorites' | 'profile' | 'family-tree';

export default function TabContainer() {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Handle navigation to family tree
  const navigateToFamilyTree = () => {
    setActiveTab('family-tree');
  };

  // Handle back navigation from family tree
  const navigateBack = () => {
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <div className="p-4">
        {/* All tabs are rendered but only the active one is visible */}
        <div className={activeTab === 'home' ? 'block' : 'hidden'}>
          <HomeTab onNavigateToFamilyTree={navigateToFamilyTree} />
        </div>
        <div className={activeTab === 'search' ? 'block' : 'hidden'}>
          <SearchTab />
        </div>
        <div className={activeTab === 'favorites' ? 'block' : 'hidden'}>
          <FavoritesTab />
        </div>
        <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
          <ProfileTab />
        </div>
        <div className={activeTab === 'family-tree' ? 'block' : 'hidden'}>
          <FamilyTreeTab onBack={navigateBack} />
        </div>
      </div>
      
      {/* Only show bottom navigation when not in family tree */}
      {activeTab !== 'family-tree' && (
        <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}
