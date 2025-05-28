'use client';

import { DuplicateMatch } from '@/lib/duplicateDetection';

interface DuplicateConfirmationModalProps {
  isOpen: boolean;
  newPersonName: string;
  matches: DuplicateMatch[];
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DuplicateConfirmationModal({
  isOpen,
  newPersonName,
  matches,
  onConfirm,
  onCancel,
  loading = false
}: DuplicateConfirmationModalProps) {
  if (!isOpen) return null;

  // Only show the highest confidence match
  const highestMatch = matches[0];
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-red-600 dark:text-red-400';
    if (confidence >= 0.8) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[99999] backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 my-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              ⚠️ Similar Person Found
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>You&apos;re trying to add:</strong> &quot;{newPersonName}&quot;
            </p>
          </div>
        </div>

        {/* Single Match Display */}
        <div className="p-6">
          {highestMatch ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                A similar person already exists:
              </h3>
              
              <div className="border border-yellow-200 dark:border-yellow-600 rounded-lg p-4 mb-6 bg-yellow-50 dark:bg-yellow-900/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {highestMatch.person.name}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceColor(highestMatch.confidence)} bg-current bg-opacity-10`}>
                        {getConfidenceLabel(highestMatch.confidence)} Match ({Math.round(highestMatch.confidence * 100)}%)
                      </span>
                    </div>
                    
                    {highestMatch.person.fatherName && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Father: {highestMatch.person.fatherName}
                      </p>
                    )}
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <strong>Why it matches:</strong> {highestMatch.reasons.join(', ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                      Possible Duplicate Detected
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      This person might already exist in your family tree. Please review the match above to ensure you&apos;re not creating a duplicate entry.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No matches found.</p>
            </div>
          )}
        </div>

        {/* Footer with Action Buttons */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </div>
              ) : (
                'Add Anyway'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
