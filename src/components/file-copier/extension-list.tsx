import { CheckSquare, Square } from 'lucide-react';
import { ExtensionMap, FileInfo } from '@/types/files';

interface ExtensionListProps {
  extensions: ExtensionMap;
  files: FileInfo[];
  selectedFiles: Set<string>;
  onToggleExtension: (extension: string) => void;
}

export function ExtensionList({
  extensions,
  files,
  selectedFiles,
  onToggleExtension
}: ExtensionListProps) {
  return (
    <div className="col-span-1 border rounded p-4">
      <h2 className="font-semibold mb-4">Extensions</h2>
      <div className="space-y-2">
        {Array.from(extensions.entries()).map(([ext, count]) => {
          const extensionFiles = files.filter(f => f.extension === ext);
          const allSelected = extensionFiles.every(f => selectedFiles.has(f.path));
          
          return (
            <button
              key={ext}
              onClick={() => onToggleExtension(ext)}
              className="flex items-center gap-2 w-full px-2 py-1 hover:bg-gray-100 rounded text-left"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-500" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              {ext || '(no extension)'} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
}