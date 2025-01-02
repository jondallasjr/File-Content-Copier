import { CheckSquare, Square, Search } from 'lucide-react';
import { FileInfo } from '@/types/files';
import { useMemo, useState } from 'react';

interface FileListProps {
  files: FileInfo[];
  selectedFiles: Set<string>;
  onToggleFile: (path: string) => void;
}

export function FileList({ files, selectedFiles, onToggleFile }: FileListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    
    const query = searchQuery.toLowerCase();
    return files.filter(file => 
      file.path.toLowerCase().includes(query) || 
      file.extension.toLowerCase().includes(query)
    );
  }, [files, searchQuery]);

  return (
    <div className="col-span-3 border rounded p-4">
      <h2 className="font-semibold mb-4">Files</h2>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-1 max-h-96 overflow-y-auto">
        {filteredFiles.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No files match your search</p>
        ) : (
          filteredFiles.map(file => (
            <button
              key={file.path}
              onClick={() => onToggleFile(file.path)}
              className="flex items-center gap-2 w-full px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-left transition-colors"
            >
              {selectedFiles.has(file.path) ? (
                <CheckSquare className="w-4 h-4 text-blue-500" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span className="truncate">{file.path}</span>
              {file.size && (
                <span className="text-xs text-gray-500 ml-auto">
                  {(file.size / 1024).toFixed(1)}KB
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}