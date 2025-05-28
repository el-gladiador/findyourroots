'use client';

import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  HeartIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  MagnifyingGlassIcon as MagnifyingGlassIconSolid, 
  HeartIcon as HeartIconSolid, 
  UserIcon as UserIconSolid 
} from '@heroicons/react/24/solid';
import { TabType } from './TabContainer';

const navigation = [
  {
    name: 'Home',
    tab: 'home' as TabType,
    icon: HomeIcon,
    iconActive: HomeIconSolid,
  },
  {
    name: 'Search',
    tab: 'search' as TabType,
    icon: MagnifyingGlassIcon,
    iconActive: MagnifyingGlassIconSolid,
  },
  {
    name: 'Favorites',
    tab: 'favorites' as TabType,
    icon: HeartIcon,
    iconActive: HeartIconSolid,
  },
  {
    name: 'Profile',
    tab: 'profile' as TabType,
    icon: UserIcon,
    iconActive: UserIconSolid,
  },
];

interface BottomNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function BottomNavigation({ activeTab, setActiveTab }: BottomNavigationProps) {

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 ios-safe-bottom">
      <nav className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {navigation.map((item) => {
          const isActive = activeTab === item.tab;
          const Icon = isActive ? item.iconActive : item.icon;
          
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.tab)}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-colors duration-200 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className={`text-xs font-medium ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
