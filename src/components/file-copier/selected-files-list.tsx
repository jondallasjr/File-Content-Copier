import { FileInfo } from '@/types/files';
import { CheckSquare } from 'lucide-react';

interface SelectedFilesListProps {
  files: FileInfo[];
  selectedFiles: Set<string>;
  onToggleFile: (path: string) => void;
}

export function SelectedFilesList({ files, selectedFiles, onToggleFile }: SelectedFilesListProps) {
  const selectedFilesList = files.filter(file => selectedFiles.has(file.path));

  return (
    <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
      {selectedFilesList.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No files selected</p>
      ) : (
        selectedFilesList.map(file => (
          <button
            key={file.path}
            onClick={() => onToggleFile(file.path)}
            className="flex items-center gap-2 w-full px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-left transition-colors"
          >
            <CheckSquare className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="truncate flex-grow">{file.path}</span>
            {file.size && (
              <span className="text-xs text-gray-500 flex-shrink-0">
                {(file.size / 1024).toFixed(1)}KB
              </span>
            )}
          </button>
        ))
      )}
    </div>
  );
}