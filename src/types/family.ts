export interface Person {
  id: string;
  name: string;
  fatherName?: string;
  fatherId?: string;
  createdAt: Date;
}

export interface FamilyTreeData {
  people: Person[];
  loading: boolean;
  error: string | null;
  addPerson: (person: Omit<Person, 'id' | 'createdAt'>) => Promise<void>;
  removePerson: (id: string) => Promise<void>;
  updatePerson: (id: string, updates: Partial<Person>) => Promise<void>;
  clearTree: () => Promise<void>;
  getPerson: (id: string) => Person | undefined;
  getChildren: (parentId: string) => Person[];
  getFamilyTree: () => FamilyNode[];
}

export interface FamilyNode {
  person: Person;
  children: FamilyNode[];
}
