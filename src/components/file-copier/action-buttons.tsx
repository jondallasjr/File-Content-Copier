import { Folder, Copy } from 'lucide-react';

interface ActionButtonsProps {
  onFolderSelect: () => void;
  onCopySelected: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  selectedCount: number;
  totalFiles: number;
  loading: boolean;
}

export function ActionButtons({
  onFolderSelect,
  onCopySelected,
  onSelectAll,
  onDeselectAll,
  selectedCount,
  totalFiles,
  loading
}: ActionButtonsProps) {
  return (
    <div className="mb-4 flex items-center gap-4">
      <button
        onClick={onFolderSelect}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        <Folder className="w-4 h-4" />
        Select Folder
      </button>
      
      <button
        onClick={onCopySelected}
        disabled={loading || selectedCount === 0}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
      >
        <Copy className="w-4 h-4" />
        Copy Selected ({selectedCount})
      </button>
      
      <button
        onClick={onSelectAll}
        disabled={loading || totalFiles === 0}
        className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100 disabled:opacity-50"
      >
        Select All
      </button>
      
      <button
        onClick={onDeselectAll}
        disabled={loading || selectedCount === 0}
        className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100 disabled:opacity-50"
      >
        Deselect All
      </button>
    </div>
  );
}