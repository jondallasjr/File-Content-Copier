import React, { useMemo, useState } from 'react';
import { CheckSquare, Square, ChevronDown, ChevronRight } from 'lucide-react';
import { ExtensionMap, FileInfo } from '@/types/files';
import { PREFERRED_EXTENSIONS, BINARY_EXTENSIONS } from '@/lib/constants';

// Define code-related extensions
const CODE_EXTENSIONS = new Set([
  'js', 'jsx', 'ts', 'tsx', 'py', 'rb', 'php', 'java', 'cpp', 'c',
  'go', 'rs', 'swift', 'kt', 'cs', 'scala', 'lua', 'r', 'pl'
]);

interface ExtensionGroupProps {
  title: string;
  extensions: [string, number][];
  files: FileInfo[];
  selectedFiles: Set<string>;
  onToggleExtension: (ext: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function ExtensionGroup({ 
  title, 
  extensions,
  files,
  selectedFiles,
  onToggleExtension,
  isExpanded,
  onToggleExpand
}: ExtensionGroupProps) {
  if (extensions.length === 0) return null;

  return (
    <div className="border rounded mb-2">
      <button
        onClick={onToggleExpand}
        className="w-full px-4 py-2 text-left font-medium flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <span>{title} ({extensions.length})</span>
        {isExpanded ? 
          <ChevronDown className="w-4 h-4" /> : 
          <ChevronRight className="w-4 h-4" />
        }
      </button>
      
      {isExpanded && (
        <div className="p-2 space-y-1 border-t dark:border-gray-700">
          {extensions.map(([ext, count]) => {
            const extensionFiles = files.filter(f => f.extension === ext);
            const allSelected = extensionFiles.every(f => selectedFiles.has(f.path));
            
            return (
              <button
                key={ext}
                onClick={() => onToggleExtension(ext)}
                className="flex items-center gap-2 w-full px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-left"
              >
                {allSelected ? (
                  <CheckSquare className="w-4 h-4 text-blue-500" />
                ) : (
                  <Square className="w-4 h-4 text-gray-400" />
                )}
                {ext ? (
                  <>
                    <span className="text-blue-400">.</span>
                    <span className="font-mono">{ext}</span>
                  </>
                ) : (
                  '(no extension)'
                )}
                <span className="text-gray-400 text-sm ml-auto">({count})</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function GroupedExtensionsList({
  extensions,
  files,
  selectedFiles,
  onToggleExtension
}: {
  extensions: ExtensionMap;
  files: FileInfo[];
  selectedFiles: Set<string>;
  onToggleExtension: (extension: string) => void;
}) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['preferred']));

  const {
    preferredExts,
    codeExts,
    binaryExts,
    otherExts
  } = useMemo(() => {
    const sorted = Array.from(extensions.entries()).sort((a, b) => b[1] - a[1]);
    
    return sorted.reduce((acc, [ext, count]) => {
      const entry: [string, number] = [ext, count];
      
      if (PREFERRED_EXTENSIONS.has(ext)) {
        acc.preferredExts.push(entry);
      } else if (CODE_EXTENSIONS.has(ext)) {
        acc.codeExts.push(entry);
      } else if (BINARY_EXTENSIONS.has(ext)) {
        acc.binaryExts.push(entry);
      } else {
        acc.otherExts.push(entry);
      }
      
      return acc;
    }, {
      preferredExts: [] as [string, number][],
      codeExts: [] as [string, number][],
      binaryExts: [] as [string, number][],
      otherExts: [] as [string, number][]
    });
  }, [extensions]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  return (
    <div className="p-4">
      <ExtensionGroup
        title="Preferred Extensions"
        extensions={preferredExts}
        files={files}
        selectedFiles={selectedFiles}
        onToggleExtension={onToggleExtension}
        isExpanded={expandedGroups.has('preferred')}
        onToggleExpand={() => toggleGroup('preferred')}
      />
      
      <ExtensionGroup
        title="Code Files"
        extensions={codeExts}
        files={files}
        selectedFiles={selectedFiles}
        onToggleExtension={onToggleExtension}
        isExpanded={expandedGroups.has('code')}
        onToggleExpand={() => toggleGroup('code')}
      />
      
      <ExtensionGroup
        title="Binary Files"
        extensions={binaryExts}
        files={files}
        selectedFiles={selectedFiles}
        onToggleExtension={onToggleExtension}
        isExpanded={expandedGroups.has('binary')}
        onToggleExpand={() => toggleGroup('binary')}
      />
      
      {otherExts.length > 0 && (
        <ExtensionGroup
          title="Other Extensions"
          extensions={otherExts}
          files={files}
          selectedFiles={selectedFiles}
          onToggleExtension={onToggleExtension}
          isExpanded={expandedGroups.has('other')}
          onToggleExpand={() => toggleGroup('other')}
        />
      )}
    </div>
  );
}