import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, CheckSquare, Square, Search } from 'lucide-react';
import { FileInfo } from '@/types/files';

interface TreeNode {
  name: string;
  path: string;
  children: Map<string, TreeNode>;
  files: FileInfo[];
  fileCount: number;
}

interface DirectoryTreeProps {
  files: FileInfo[];
  selectedFiles: Set<string>;
  onToggleDirectory: (directory: string) => void;
  onToggleFile: (path: string) => void;
}

function buildDirectoryTree(files: FileInfo[]): TreeNode {
  const root: TreeNode = {
    name: 'root',
    path: '/',
    children: new Map(),
    files: [],
    fileCount: 0
  };

  files.forEach(file => {
    const parts = file.path.split('/');
    let currentNode = root;
    let currentPath = '';

    // Process all parts except the last one (which is the file name)
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      if (!currentNode.children.has(part)) {
        currentNode.children.set(part, {
          name: part,
          path: currentPath,
          children: new Map(),
          files: [],
          fileCount: 0
        });
      }
      currentNode = currentNode.children.get(part)!;
      currentNode.fileCount++;
    }

    // Add the file to its parent directory's files array
    currentNode.files.push(file);
  });

  return root;
}

function DirectoryTreeNode({ 
  node, 
  level = 0,
  selectedFiles,
  onToggleDirectory,
  onToggleFile,
  expanded,
  onToggleExpand,
  searchQuery
}: { 
  node: TreeNode;
  level?: number;
  selectedFiles: Set<string>;
  onToggleDirectory: (path: string) => void;
  onToggleFile: (path: string) => void;
  expanded: Set<string>;
  onToggleExpand: (path: string) => void;
  searchQuery: string;
}) {
  const allSelected = node.fileCount > 0 && 
                     node.files.every(f => selectedFiles.has(f.path)) &&
                     Array.from(node.children.values()).every(child => 
                       child.files.every(f => selectedFiles.has(f.path)));
                       
  const someSelected = node.files.some(f => selectedFiles.has(f.path)) ||
                      Array.from(node.children.values()).some(child => 
                        child.files.some(f => selectedFiles.has(f.path)));
                        
  const hasChildren = node.children.size > 0 || node.files.length > 0;
  const isExpanded = expanded.has(node.path);

  // Filter node contents based on search query
  const matchesSearch = searchQuery === '' || 
    node.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.files.some(f => f.path.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!matchesSearch) return null;

  return (
    <div>
      {/* Directory Entry */}
      {node.path !== '/' && (
        <div 
          className="flex items-center w-full hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-left group"
          style={{ paddingLeft: `${level * 16}px` }}
        >
          {/* Expand/Collapse control */}
          <div 
            onClick={() => hasChildren && onToggleExpand(node.path)}
            className={`w-8 h-8 flex items-center justify-center ${hasChildren ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded' : ''}`}
          >
            {hasChildren && (
              isExpanded ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </div>
          
          {/* Checkbox */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleDirectory(node.path);
            }}
            className="cursor-pointer p-2"
          >
            {someSelected ? (
              <CheckSquare className={`w-4 h-4 ${allSelected ? 'text-blue-500' : 'text-blue-300'}`} />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
          </div>
          
          {/* Directory name */}
          <span 
            onClick={() => hasChildren && onToggleExpand(node.path)}
            className="py-2 cursor-pointer font-medium truncate"
          >
            {node.name}
          </span>
          
          {/* File count */}
          <span className="ml-auto text-gray-400 text-sm pr-4">
            ({node.fileCount})
          </span>
        </div>
      )}

      {/* Files and Subdirectories */}
      {isExpanded && (
        <div>
          {/* Files in current directory */}
          {node.files
            .filter(file => !searchQuery || file.path.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(file => (
              <div
                key={file.path}
                className="flex items-center w-full hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-left"
                style={{ paddingLeft: `${(level + 1) * 16}px` }}
              >
                <div className="w-8 h-8" /> {/* Spacing for alignment */}
                <div
                  onClick={() => onToggleFile(file.path)}
                  className="cursor-pointer p-2"
                >
                  {selectedFiles.has(file.path) ? (
                    <CheckSquare className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <span className="py-2 font-mono text-sm truncate">
                  {file.name}
                </span>
              </div>
            ))}

          {/* Subdirectories */}
          {Array.from(node.children.values()).map(child => (
            <DirectoryTreeNode
              key={child.path}
              node={child}
              level={level + 1}
              selectedFiles={selectedFiles}
              onToggleDirectory={onToggleDirectory}
              onToggleFile={onToggleFile}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DirectoryTree({ files, selectedFiles, onToggleDirectory, onToggleFile }: DirectoryTreeProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(['/']));
  const [searchQuery, setSearchQuery] = useState('');
  const tree = useMemo(() => buildDirectoryTree(files), [files]);

  const handleToggleExpand = (path: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Box */}
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

      {/* Tree Structure */}
      <div className="space-y-1 max-h-[calc(100vh-400px)] overflow-y-auto">
        <DirectoryTreeNode
          node={tree}
          selectedFiles={selectedFiles}
          onToggleDirectory={onToggleDirectory}
          onToggleFile={onToggleFile}
          expanded={expanded}
          onToggleExpand={handleToggleExpand}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}