// src/components/file-copier/extension-filter.tsx
import { FileInfo } from '@/types/files';
import { ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';

interface ExtensionFilterProps {
  files: FileInfo[];
  onFilterChange: (extension: string | null) => void;
}

export function ExtensionFilter({ files, onFilterChange }: ExtensionFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const extensions = useMemo(() => {
    const extMap = new Map<string, number>();
    
    files.forEach(file => {
      if (file.isText) {
        const ext = file.extension || '(no extension)';
        extMap.set(ext, (extMap.get(ext) || 0) + 1);
      }
    });
    
    return Array.from(extMap.entries())
      .sort((a, b) => b[1] - a[1]); // Sort by count, descending
  }, [files]);

  if (extensions.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border rounded bg-white dark:bg-gray-800 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <span>Filter by Extension</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded shadow-lg max-h-60 overflow-y-auto">
          <button
            onClick={() => {
              onFilterChange(null);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            All Extensions
          </button>
          
          {extensions.map(([ext, count]) => (
            <button
              key={ext}
              onClick={() => {
                onFilterChange(ext === '(no extension)' ? '' : ext);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
            >
              <span className="font-mono">{ext}</span>
              <span className="text-gray-500 text-sm">({count})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}