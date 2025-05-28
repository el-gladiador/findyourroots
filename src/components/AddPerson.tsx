'use client';

import { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { detectDuplicates, DuplicateDetectionResult } from '@/lib/duplicateDetection';
import DuplicateConfirmationModal from './DuplicateConfirmationModal';

interface AddPersonProps {
  onClose: () => void;
  parentId?: string;
}

export default function AddPerson({ onClose, parentId }: AddPersonProps) {
  const { addPersonWithOverride, getPerson, people } = useFamily();
  const { authUser } = useAuth();
  
  // Check if user can add people (not guest)
  const canAdd = !authUser?.isGuest;

  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateResult, setDuplicateResult] = useState<DuplicateDetectionResult | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingPersonData, setPendingPersonData] = useState<{
    name: string;
    fatherId?: string;
    fatherName?: string;
  } | null>(null);

  // Get parent information if parentId is provided
  const parentPerson = parentId ? getPerson(parentId) : null;

  const buildPersonData = () => {
    const personData: {
      name: string;
      fatherId?: string;
      fatherName?: string;
    } = {
      name: formData.name.trim(),
    };

    // If parentId is provided (from "Add Child" button), use it automatically
    if (parentId && parentPerson) {
      personData.fatherId = parentId;
      personData.fatherName = parentPerson.name;
    } 
    // Otherwise, if user manually entered a father name, try to find that person
    else if (formData.fatherName.trim()) {
      const father = people.find(p => 
        p.name.toLowerCase() === formData.fatherName.trim().toLowerCase()
      );
      if (father) {
        personData.fatherId = father.id;
        personData.fatherName = father.name;
      } else {
        personData.fatherName = formData.fatherName.trim();
      }
    }

    return personData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !canAdd) return;

    setIsLoading(true);
    setError(null);

    try {
      const personData = buildPersonData();

      // Check for duplicates BEFORE saving
      const duplicateDetectionResult = detectDuplicates({
        name: personData.name,
        fatherName: personData.fatherName,
        fatherId: personData.fatherId
      }, people);

      if (duplicateDetectionResult.suggestedAction === 'block') {
        // 90%+ confidence - complete block
        const highestMatch = duplicateDetectionResult.matches[0];
        const confidence = Math.round(highestMatch.confidence * 100);
        setError(`Cannot add "${personData.name}" - this person already exists in the family tree (${confidence}% match with "${highestMatch.person.name}"). Please check if this person is already in the tree.`);
        setIsLoading(false);
        return;
      } else if (duplicateDetectionResult.suggestedAction === 'review') {
        // 80-89% confidence - show modal
        setDuplicateResult(duplicateDetectionResult);
        setPendingPersonData(personData);
        setShowDuplicateModal(true);
        setIsLoading(false);
        return;
      }

      // Less than 80% confidence or no duplicates - proceed directly
      await addPersonWithOverride(personData);
      setFormData({ name: '', fatherName: '' });
      onClose();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add person');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateConfirm = async () => {
    if (!pendingPersonData) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await addPersonWithOverride(pendingPersonData);
      setFormData({ name: '', fatherName: '' });
      setShowDuplicateModal(false);
      setDuplicateResult(null);
      setPendingPersonData(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add person');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateCancel = () => {
    setShowDuplicateModal(false);
    setDuplicateResult(null);
    setPendingPersonData(null);
    setIsLoading(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-all duration-300"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl border border-gray-200 dark:border-gray-700 transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {parentPerson ? `Add Child to ${parentPerson.name}` : 'Add Person'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!canAdd && (
          <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                Guest users cannot add people. Please sign in.
              </p>
            </div>
          </div>
        )}

        {parentPerson && (
          <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                Adding child to: <strong>{parentPerson.name}</strong>
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter person's name"
              required
              disabled={!canAdd}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Father Name {parentPerson ? '(Auto-filled)' : '(Optional)'}
            </label>
            <input
              type="text"
              value={parentPerson ? parentPerson.name : formData.fatherName}
              onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              placeholder="Enter father's name"
              disabled={!canAdd || !!parentPerson}
            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || isLoading || !canAdd}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Adding...' : (parentPerson ? 'Add Child' : 'Add Person')}
            </button>
          </div>
        </form>
      </div>

      {/* Duplicate Confirmation Modal */}
      {showDuplicateModal && duplicateResult && (
        <DuplicateConfirmationModal
          isOpen={showDuplicateModal}
          newPersonName={formData.name.trim()}
          matches={duplicateResult.matches}
          onConfirm={handleDuplicateConfirm}
          onCancel={handleDuplicateCancel}
          loading={isLoading}
        />
      )}
    </div>
  );
}
