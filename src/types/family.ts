export interface Person {
  id: string;
  name: string;
  fatherName?: string;
  fatherId?: string;
  createdAt: Date;
}

export interface FamilyTreeData {
  people: Person[];
  addPerson: (person: Omit<Person, 'id' | 'createdAt'>) => void;
  removePerson: (id: string) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  clearTree: () => void;
  getPerson: (id: string) => Person | undefined;
  getChildren: (parentId: string) => Person[];
  getFamilyTree: () => FamilyNode[];
}

export interface FamilyNode {
  person: Person;
  children: FamilyNode[];
}
