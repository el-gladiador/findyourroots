import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot,
  Timestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { Person } from '@/types/family';

// Collection name
const COLLECTION_NAME = 'people';

// Convert Firestore timestamp to Date
const convertTimestamp = (timestamp: unknown): Date => {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof (timestamp as { toDate: () => Date }).toDate === 'function') {
    return (timestamp as { toDate: () => Date }).toDate();
  }
  return new Date(timestamp as string | number | Date);
};

// Convert Person data for Firestore (dates to timestamps)
const convertPersonForFirestore = (person: Omit<Person, 'id'>) => {
  const firestoreData: Record<string, unknown> = {
    name: person.name,
    createdAt: Timestamp.fromDate(person.createdAt),
  };

  // Only include optional fields if they have values
  if (person.fatherName !== undefined && person.fatherName !== null) {
    firestoreData.fatherName = person.fatherName;
  }
  if (person.fatherId !== undefined && person.fatherId !== null) {
    firestoreData.fatherId = person.fatherId;
  }

  return firestoreData;
};

// Convert Firestore document to Person
const convertDocToPerson = (doc: DocumentSnapshot): Person => {
  const data = doc.data();
  if (!data) {
    throw new Error('Document data is undefined');
  }
  return {
    id: doc.id,
    name: data.name,
    fatherName: data.fatherName || undefined,
    fatherId: data.fatherId || undefined,
    createdAt: convertTimestamp(data.createdAt),
  };
};

export class FirestoreService {
  // Get all people
  static async getAllPeople(): Promise<Person[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertDocToPerson);
    } catch (error) {
      console.error('Error fetching people:', error);
      throw new Error('Failed to fetch people from database');
    }
  }

  // Add a new person
  static async addPerson(personData: Omit<Person, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(
        collection(db, COLLECTION_NAME), 
        convertPersonForFirestore(personData)
      );
      return docRef.id;
    } catch (error) {
      console.error('Error adding person:', error);
      throw new Error('Failed to add person to database');
    }
  }

  // Update a person
  static async updatePerson(id: string, updates: Partial<Omit<Person, 'id'>>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {};
      
      // Only include fields that are not undefined
      Object.keys(updates).forEach(key => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (updates as any)[key];
        if (value !== undefined) {
          if (key === 'createdAt' && value instanceof Date) {
            updateData[key] = Timestamp.fromDate(value);
          } else {
            updateData[key] = value;
          }
        }
      });
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating person:', error);
      throw new Error('Failed to update person in database');
    }
  }

  // Delete a person
  static async deletePerson(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting person:', error);
      throw new Error('Failed to delete person from database');
    }
  }

  // Clear all people (for clearing the entire tree)
  static async clearAllPeople(): Promise<void> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error clearing people:', error);
      throw new Error('Failed to clear all people from database');
    }
  }

  // Subscribe to real-time updates
  static subscribeToUpdates(callback: (people: Person[]) => void): () => void {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const people = querySnapshot.docs.map(convertDocToPerson);
      callback(people);
    }, (error) => {
      console.error('Error in real-time subscription:', error);
    });
  }
}
