'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Person, FamilyTreeData, FamilyNode } from '@/types/family';

const FamilyContext = createContext<FamilyTreeData | undefined>(undefined);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<Person[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('familyTreeData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPeople(parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt)
        })));
      } catch (error) {
        console.error('Failed to load family data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever people changes
  useEffect(() => {
    if (people.length > 0) {
      localStorage.setItem('familyTreeData', JSON.stringify(people));
    }
  }, [people]);

  const addPerson = (personData: Omit<Person, 'id' | 'createdAt'>) => {
    const newPerson: Person = {
      ...personData,
      id: generateId(),
      createdAt: new Date(),
    };
    
    // If fatherName is provided but no fatherId, try to find the father by name
    if (personData.fatherName && !personData.fatherId) {
      const father = people.find(p => p.name.toLowerCase() === personData.fatherName?.toLowerCase());
      if (father) {
        newPerson.fatherId = father.id;
      }
    }
    
    setPeople(prev => [...prev, newPerson]);
  };

  const removePerson = (id: string) => {
    setPeople(prev => prev.filter(p => p.id !== id));
  };

  const updatePerson = (id: string, updates: Partial<Person>) => {
    setPeople(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const clearTree = () => {
    setPeople([]);
    localStorage.removeItem('familyTreeData');
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

  const value: FamilyTreeData = {
    people,
    addPerson,
    removePerson,
    updatePerson,
    clearTree,
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

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
