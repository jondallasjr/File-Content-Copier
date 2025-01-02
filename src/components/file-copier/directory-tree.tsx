import React, { useMemo } from 'react';
import { ChevronDown, ChevronRight, CheckSquare, Square, FolderIcon } from 'lucide-react';
import { FileInfo } from '@/types/files';

interface TreeNode {
  name: string;
  path: string;
  children: Map<string, TreeNode>;
  fileCount: number;
}

interface DirectoryTreeProps {
  files: FileInfo[];
  selectedFiles: Set<string>;
  onToggleDirectory: (directory: string) => void;
}

function buildDirectoryTree(files: FileInfo[]): TreeNode {
  const root: TreeNode = {
    name: 'root',
    path: '/',
    children: new Map(),
    fileCount: 0
  };

  files.forEach(file => {
    const parts = file.path.split('/');
    let currentNode = root;
    let currentPath = '';

    parts.slice(0, -1).forEach(part => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      if (!currentNode.children.has(part)) {
        currentNode.children.set(part, {
          name: part,
          path: currentPath,
          children: new Map(),
          fileCount: 0
        });
      }
      currentNode = currentNode.children.get(part)!;
      currentNode.fileCount++;
    });
  });

  return root;
}

function DirectoryTreeNode({ 
  node, 
  level = 0,
  selectedFiles,
  files,
  onToggleDirectory,
  expanded,
  onToggleExpand
}: { 
  node: TreeNode;
  level?: number;
  selectedFiles: Set<string>;
  files: FileInfo[];
  onToggleDirectory: (path: string) => void;
  expanded: Set<string>;
  onToggleExpand: (path: string) => void;
}) {
  const dirFiles = files.filter(f => {
    const dirPath = node.path === '/' ? '' : node.path;
    return f.path.startsWith(dirPath + '/') && 
           f.path.slice(dirPath.length + 1).split('/').length === 1;
  });
  
  const allSelected = dirFiles.length > 0 && 
                     dirFiles.every(f => selectedFiles.has(f.path));
  const someSelected = dirFiles.some(f => selectedFiles.has(f.path));
  const hasChildren = node.children.size > 0;
  const isExpanded = expanded.has(node.path);

  return (
    <div>
      <div 
        className="flex items-center gap-2 w-full px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-left group"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {/* Expand/Collapse control */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) {
              onToggleExpand(node.path);
            }
          }}
          className={`w-6 h-6 flex items-center justify-center ${hasChildren ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded' : ''}`}
        >
          {hasChildren && (
            isExpanded ? 
              <ChevronDown className="w-4 h-4 text-gray-500" /> : 
              <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </div>
        
        {/* Checkbox control */}
        {node.path !== '/' && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleDirectory(node.path);
            }}
            className="cursor-pointer"
          >
            {someSelected ? (
              <CheckSquare className={`w-4 h-4 ${allSelected ? 'text-blue-500' : 'text-blue-300'}`} />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
          </div>
        )}
        
        {/* Directory name and info */}
        <div 
          onClick={() => onToggleExpand(node.path)}
          className="flex items-center gap-2 flex-1 cursor-pointer"
        >
          <FolderIcon className="w-4 h-4 text-gray-400" />
          <span className="truncate">
            {node.path === '/' ? 'root' : node.name}
          </span>
          <span className="text-gray-400 text-sm ml-auto">
            ({node.fileCount})
          </span>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {Array.from(node.children.values()).map(child => (
            <DirectoryTreeNode
              key={child.path}
              node={child}
              level={level + 1}
              selectedFiles={selectedFiles}
              files={files}
              onToggleDirectory={onToggleDirectory}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DirectoryTree({ files, selectedFiles, onToggleDirectory }: DirectoryTreeProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(['/']));
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
    <div className="space-y-1 p-4">
      <DirectoryTreeNode
        node={tree}
        selectedFiles={selectedFiles}
        files={files}
        onToggleDirectory={onToggleDirectory}
        expanded={expanded}
        onToggleExpand={handleToggleExpand}
      />
    </div>
  );
}