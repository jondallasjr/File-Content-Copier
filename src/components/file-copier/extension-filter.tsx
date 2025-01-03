import React, { useState, useEffect } from 'react';
import { ChevronDown, Square, CheckSquare } from 'lucide-react';

interface ExtensionFilterProps {
  files: { extension: string }[]; // Files array with extension property
  onFilterChange: (extensions: Set<string>) => void;
}

export function ExtensionFilter({ files, onFilterChange }: ExtensionFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExtensions, setSelectedExtensions] = useState<Set<string>>(new Set());
  const [showAllExtensions, setShowAllExtensions] = useState(false);

  // Auto-select preferred extensions on mount
  useEffect(() => {
    // Initialize with empty set to select none (all)
    setSelectedExtensions(new Set());
    onFilterChange(new Set());
  }, [files, onFilterChange]);

  // Get unique extensions from files, ordered by frequency
  const extensions = Array.from(
    new Set(files.map(file => file.extension))
  ).sort((a, b) => {
    const countA = files.filter(f => f.extension === a).length;
    const countB = files.filter(f => f.extension === b).length;
    return countB - countA; // Sort by frequency (most to least)
  });

  // Show top 5 extensions by default
  const visibleExtensions = showAllExtensions ? extensions : extensions.slice(0, 5);

  // Toggle an extension in the selected set
  const handleToggleExtension = (extension: string) => {
    const newSelected = new Set(selectedExtensions);
    if (newSelected.has(extension)) {
      newSelected.delete(extension);
    } else {
      newSelected.add(extension);
    }
    setSelectedExtensions(newSelected);
    onFilterChange(newSelected);
  };

  // Toggle the "Show more" state
  const handleShowMore = () => {
    setShowAllExtensions(true);
  };

  return (
    <div className="relative extension-filter">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border rounded bg-white dark:bg-gray-800 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="truncate">
          {selectedExtensions.size === 0
            ? "Extension Filter"
            : `${selectedExtensions.size} ${selectedExtensions.size === 1 ? 'extension' : 'extensions'}`}
        </span>
        <ChevronDown 
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-64 mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-96 overflow-y-auto">
          <div className="py-1">
            {/* List of Extensions */}
            {visibleExtensions.map(extension => (
              <div
                key={extension}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <button
                  onClick={() => handleToggleExtension(extension)}
                  className="w-full flex items-center justify-between group"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      {selectedExtensions.has(extension) ? (
                        <CheckSquare className="w-4 h-4 text-blue-500 mr-2" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400 mr-2" />
                      )}
                      <span className="font-medium">{extension}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">
                    ({files.filter(f => f.extension === extension).length})
                  </span>
                </button>
              </div>
            ))}

            {/* Show More Button */}
            {!showAllExtensions && extensions.length > 5 && (
              <button
                onClick={handleShowMore}
                className="w-full px-4 py-2 text-sm text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Show more...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}