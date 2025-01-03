import React, { useState, useEffect } from 'react';
import { ChevronDown, Square, CheckSquare, X } from 'lucide-react';
import { EXTENSION_CATEGORIES, DEFAULT_SELECTED_CATEGORIES } from '@/lib/constants';

interface ExtensionFilterProps {
  onFilterChange: (extensions: Set<string>) => void;
}

export function ExtensionFilter({ onFilterChange }: ExtensionFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(DEFAULT_SELECTED_CATEGORIES)
  );

  // Initialize with default categories
  useEffect(() => {
    const initialExtensions = new Set(
      EXTENSION_CATEGORIES
        .filter(cat => DEFAULT_SELECTED_CATEGORIES.includes(cat.name))
        .flatMap(cat => cat.extensions)
    );
    onFilterChange(initialExtensions);
  }, [onFilterChange]);

  // Get the total number of extensions across all categories
  const totalExtensions = EXTENSION_CATEGORIES.reduce(
    (sum, category) => sum + category.extensions.length,
    0
  );

  // Handler for toggling individual categories
  const handleCategoryToggle = (categoryName: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryName)) {
      newSelected.delete(categoryName);
    } else {
      newSelected.add(categoryName);
    }
    setSelectedCategories(newSelected);

    // Update selected extensions based on categories
    const selectedExtensions = new Set(
      EXTENSION_CATEGORIES
        .filter(cat => newSelected.has(cat.name))
        .flatMap(cat => cat.extensions)
    );
    onFilterChange(selectedExtensions);
  };

  // Handler for selecting/deselecting all categories
  const handleSelectAll = () => {
    if (selectedCategories.size === EXTENSION_CATEGORIES.length) {
      // If all are selected, clear selection
      setSelectedCategories(new Set());
      onFilterChange(new Set());
    } else {
      // Select all categories
      const allCategories = new Set(EXTENSION_CATEGORIES.map(cat => cat.name));
      setSelectedCategories(allCategories);
      const allExtensions = new Set(
        EXTENSION_CATEGORIES.flatMap(cat => cat.extensions)
      );
      onFilterChange(allExtensions);
    }
  };

  // Handler for clearing all selections
  const handleClearAll = () => {
    setSelectedCategories(new Set());
    onFilterChange(new Set());
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.extension-filter')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          {selectedCategories.size === 0
            ? "Select Extensions"
            : selectedCategories.size === EXTENSION_CATEGORIES.length
            ? "All Extensions"
            : `${selectedCategories.size} categories selected`}
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
          {/* Header with Select All and Clear */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b px-4 py-2 flex justify-between items-center">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {selectedCategories.size === EXTENSION_CATEGORIES.length
                ? "Deselect All"
                : "Select All"}
            </button>
            {selectedCategories.size > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </button>
            )}
          </div>

          {/* Categories List */}
          <div className="py-1">
            {EXTENSION_CATEGORIES.map(category => (
              <div
                key={category.name}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <button
                  onClick={() => handleCategoryToggle(category.name)}
                  className="w-full flex items-center justify-between group"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      {selectedCategories.has(category.name) ? (
                        <CheckSquare className="w-4 h-4 text-blue-500 mr-2" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400 mr-2" />
                      )}
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {category.extensions.join(', ')}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">
                    ({category.extensions.length})
                  </span>
                </button>
              </div>
            ))}
          </div>

          {/* Footer with Extension Count */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t px-4 py-2 text-xs text-gray-500">
            {selectedCategories.size > 0 ? (
              <>
                {EXTENSION_CATEGORIES
                  .filter(cat => selectedCategories.has(cat.name))
                  .reduce((sum, cat) => sum + cat.extensions.length, 0)}{' '}
                of {totalExtensions} extensions selected
              </>
            ) : (
              `${totalExtensions} available extensions`
            )}
          </div>
        </div>
      )}
    </div>
  );
}