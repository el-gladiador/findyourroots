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
  DocumentSnapshot,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Person } from '@/types/family';
import { detectDuplicates, DuplicateDetectionResult } from './duplicateDetection';

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

  // Add a new person with duplicate detection and atomic operation
  static async addPerson(personData: Omit<Person, 'id'>): Promise<string> {
    try {
      // Verify user is authenticated with Firebase (not just a guest user)
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be signed in with Google to add a person. Guest users cannot modify data.');
      }

      // Use transaction to ensure atomicity and prevent race conditions
      const result = await runTransaction(db, async (transaction) => {
        // Get current people for duplicate detection
        const collectionRef = collection(db, COLLECTION_NAME);
        const q = query(collectionRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const existingPeople = snapshot.docs.map(convertDocToPerson);

        // Check for duplicates
        const duplicateResult = detectDuplicates({
          name: personData.name,
          fatherName: personData.fatherName,
          fatherId: personData.fatherId
        }, existingPeople);

        // Handle different confidence levels
        if (duplicateResult.suggestedAction === 'block') {
          // 90%+ confidence - complete block with user-friendly message
          const highestMatch = duplicateResult.matches[0];
          const confidence = Math.round(highestMatch.confidence * 100);
          throw new Error(`Cannot add "${personData.name}" - this person already exists in the family tree (${confidence}% match with "${highestMatch.person.name}"). Please check if this person is already in the tree.`);
        } else if (duplicateResult.suggestedAction === 'review') {
          // 80-89% confidence - show modal for user decision
          const error = new Error('DUPLICATE_DETECTED') as Error & { duplicateInfo?: DuplicateDetectionResult };
          error.duplicateInfo = duplicateResult;
          throw error;
        }
        // Less than 80% confidence - proceed without any modal

        // Create new document reference
        const docRef = doc(collectionRef);
        
        // Add the person with transaction
        transaction.set(docRef, convertPersonForFirestore(personData));
        
        return docRef.id;
      });

      return result;
    } catch (error) {
      console.error('Error adding person:', error);
      throw error; // Pass original error for better debugging
    }
  }

  // Add person with duplicate override (when user confirms to add anyway)
  static async addPersonWithDuplicateOverride(personData: Omit<Person, 'id'>): Promise<string> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be signed in with Google to add a person. Guest users cannot modify data.');
      }

      // Add without duplicate checking
      const docRef = await addDoc(
        collection(db, COLLECTION_NAME), 
        convertPersonForFirestore(personData)
      );
      return docRef.id;
    } catch (error) {
      console.error('Error adding person with override:', error);
      throw error;
    }
  }

  // Check for potential duplicates without adding
  static async checkForDuplicates(personData: { name: string; fatherName?: string; fatherId?: string }): Promise<DuplicateDetectionResult> {
    try {
      const existingPeople = await this.getAllPeople();
      return detectDuplicates(personData, existingPeople);
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      throw new Error('Failed to check for duplicates');
    }
  }

  // Update a person
  static async updatePerson(id: string, updates: Partial<Omit<Person, 'id'>>): Promise<void> {
    try {
      // Verify user is authenticated (admin check happens in security rules)
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to update a person');
      }

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
      // Verify user is authenticated (admin check happens in security rules)
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to delete a person');
      }
      
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting person:', error);
      throw error; // Pass original error for better debugging
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
