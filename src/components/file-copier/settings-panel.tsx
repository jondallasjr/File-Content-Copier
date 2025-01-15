import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

export function SettingsPanel({
  ignoredFolders,
  onUpdateIgnoredFolders,
}: {
  ignoredFolders: string[];
  onUpdateIgnoredFolders: (folders: string[]) => void;
}) {
  const [newFolder, setNewFolder] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Only access localStorage on the client side
  useEffect(() => {
    const savedIgnoredFolders = localStorage.getItem('ignoredFolders');
    if (savedIgnoredFolders) {
      onUpdateIgnoredFolders(JSON.parse(savedIgnoredFolders));
    }
  }, [onUpdateIgnoredFolders]);

  const handleAddFolder = () => {
    if (newFolder.trim() && !ignoredFolders.includes(newFolder.trim())) {
      const updatedFolders = [...ignoredFolders, newFolder.trim()];
      onUpdateIgnoredFolders(updatedFolders);
      setNewFolder('');
    }
  };

  const handleRemoveFolder = (folder: string) => {
    const updatedFolders = ignoredFolders.filter(f => f !== folder);
    onUpdateIgnoredFolders(updatedFolders);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Settings className="w-4 h-4" />
        Settings
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          <div className="p-4">
          <h3 className="font-semibold mb-2">Ignored Files and Folders</h3>
            <div className="space-y-2">
              {ignoredFolders.map(folder => (
                <div key={folder} className="flex items-center justify-between">
                  <span className="text-sm">{folder}</span>
                  <button
                    onClick={() => handleRemoveFolder(folder)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <input
                type="text"
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                placeholder="Add file or folder to ignore"
                className="w-full px-2 py-1 border rounded"
              />
              <button
                onClick={handleAddFolder}
                className="mt-2 w-full px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}