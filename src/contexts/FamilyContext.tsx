'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Person, FamilyTreeData, FamilyNode } from '@/types/family';
import { FirestoreService } from '@/lib/firestore';

const FamilyContext = createContext<FamilyTreeData | undefined>(undefined);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize Firestore listener on mount
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let hasReceivedData = false;

    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set up real-time listener
        unsubscribe = FirestoreService.subscribeToUpdates((updatedPeople) => {
          hasReceivedData = true;
          
          // If we get empty data and we're offline, check localStorage
          if (updatedPeople.length === 0 && !isOnline) {
            const cached = loadFromLocalStorageSync();
            if (cached.length > 0) {
              setPeople(cached);
              setError('You are offline. Showing cached family tree data.');
            } else {
              setPeople(updatedPeople);
            }
          } else {
            setPeople(updatedPeople);
            // Clear any offline error when we get online data
            if (error && error.includes('offline')) {
              setError(null);
            }
          }
          setLoading(false);
        });

        // If we don't receive data within a reasonable time and we're offline, 
        // load from localStorage
        setTimeout(() => {
          if (!hasReceivedData && !isOnline) {
            const cached = loadFromLocalStorageSync();
            if (cached.length > 0) {
              setPeople(cached);
              setError('You are offline. Showing cached family tree data.');
              setLoading(false);
            }
          }
        }, 2000); // Wait 2 seconds for Firestore

      } catch (err) {
        console.error('Failed to initialize family data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load family data');
        setLoading(false);
        
        // Fallback to localStorage for development/offline
        loadFromLocalStorage();
      }
    };

    initializeData();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isOnline, error]);

  // Synchronous version of localStorage loading for offline scenarios
  const loadFromLocalStorageSync = (): Person[] => {
    try {
      const stored = localStorage.getItem('familyTreeData');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((p: Partial<Person> & { createdAt: string }) => ({
          ...p,
          createdAt: new Date(p.createdAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to load family data from localStorage:', error);
      return [];
    }
  };

  // Fallback to localStorage for development/offline mode
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('familyTreeData');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPeople(parsed.map((p: Partial<Person> & { createdAt: string }) => ({
          ...p,
          createdAt: new Date(p.createdAt)
        })));
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load family data from localStorage:', error);
      setError('Failed to load family data');
      setLoading(false);
    }
  };

  // Save to localStorage as backup
  useEffect(() => {
    if (people.length > 0 && !loading) {
      localStorage.setItem('familyTreeData', JSON.stringify(people));
    }
  }, [people, loading]);

  const addPerson = async (personData: Omit<Person, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      
      const newPersonData = {
        ...personData,
        createdAt: new Date(),
      };
      
      // If fatherName is provided but no fatherId, try to find the father by name
      if (personData.fatherName && !personData.fatherId) {
        const father = people.find(p => p.name.toLowerCase() === personData.fatherName?.toLowerCase());
        if (father) {
          newPersonData.fatherId = father.id;
        }
      }
      
      await FirestoreService.addPerson(newPersonData);
      // Real-time listener will update the state automatically
      
    } catch (err) {
      console.error('Failed to add person:', err);
      setError(err instanceof Error ? err.message : 'Failed to add person');
      throw err;
    }
  };

  const addPersonWithOverride = async (personData: Omit<Person, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      
      const newPersonData = {
        ...personData,
        createdAt: new Date(),
      };
      
      // If fatherName is provided but no fatherId, try to find the father by name
      if (personData.fatherName && !personData.fatherId) {
        const father = people.find(p => p.name.toLowerCase() === personData.fatherName?.toLowerCase());
        if (father) {
          newPersonData.fatherId = father.id;
        }
      }
      
      await FirestoreService.addPersonWithDuplicateOverride(newPersonData);
      // Real-time listener will update the state automatically
      
    } catch (err) {
      console.error('Failed to add person with override:', err);
      setError(err instanceof Error ? err.message : 'Failed to add person');
      throw err;
    }
  };

  const removePerson = async (id: string) => {
    try {
      setError(null);
      await FirestoreService.deletePerson(id);
      // Real-time listener will update the state automatically
      
    } catch (err) {
      console.error('Failed to remove person:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove person');
      throw err;
    }
  };

  const updatePerson = async (id: string, updates: Partial<Person>) => {
    try {
      setError(null);
      // Remove id from updates since Firestore doesn't store it as a field
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...updateData } = updates;
      await FirestoreService.updatePerson(id, updateData);
      // Real-time listener will update the state automatically
      
    } catch (err) {
      console.error('Failed to update person:', err);
      setError(err instanceof Error ? err.message : 'Failed to update person');
      throw err;
    }
  };

  const clearTree = async () => {
    try {
      setError(null);
      await FirestoreService.clearAllPeople();
      localStorage.removeItem('familyTreeData');
      // Real-time listener will update the state automatically
      
    } catch (err) {
      console.error('Failed to clear tree:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear tree');
      throw err;
    }
  };

  const getPerson = (id: string) => {
    return people.find(p => p.id === id);
  };

  const getChildren = (parentId: string) => {
    return people.filter(p => p.fatherId === parentId);
  };

  const getFamilyTree = (): FamilyNode[] => {
    // Find root nodes (people without fathers or whose fathers aren't in our data)
    const roots = people.filter(person => 
      !person.fatherId || !people.find(p => p.id === person.fatherId)
    );

    const buildTree = (person: Person): FamilyNode => {
      const children = getChildren(person.id);
      return {
        person,
        children: children.map(child => buildTree(child))
      };
    };

    return roots.map(root => buildTree(root));
  };

  const clearError = () => {
    setError(null);
  };

  const value: FamilyTreeData = {
    people,
    loading,
    error,
    addPerson,
    addPersonWithOverride,
    removePerson,
    updatePerson,
    clearTree,
    clearError,
    getPerson,
    getChildren,
    getFamilyTree,
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
