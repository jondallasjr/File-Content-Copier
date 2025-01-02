// src/components/file-copier/welcome.tsx
import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

export function Welcome() {
  const [isVisible, setIsVisible] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  // Check local storage on mount
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    setIsVisible(!hasSeenWelcome);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setIsVisible(false);
  };

  if (!isVisible && !isInfoOpen) {
    return (
      <button
        onClick={() => setIsInfoOpen(true)}
        className="fixed bottom-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Show information"
      >
        <Info className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Welcome to File Content Copier</h2>
        </div>
        {isVisible && (
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Dismiss
          </button>
        )}
        {isInfoOpen && (
          <button
            onClick={() => setIsInfoOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Close
          </button>
        )}
      </div>
      <div className="mt-4 space-y-3">
        <p>This tool helps you copy the contents of multiple text files into your clipboard, perfect for sharing code with AI assistants or documenting your project structure.</p>
        <div className="space-y-2">
          <p className="font-medium">How to use:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Click "Select Folder" to choose your project directory</li>
            <li>Use the Directory tree to navigate and select files</li>
            <li>Selected files will appear in the "Selected Files" panel</li>
            <li>Click "Copy Selected" to copy all selected file contents to clipboard</li>
          </ol>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Note: Only text files under 5MB will be available for selection. Binary files are automatically excluded.
        </p>
      </div>
    </div>
  );
}