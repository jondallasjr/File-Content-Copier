import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, CheckSquare, Square, Loader2 } from 'lucide-react';
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
    processingFiles: Set<string>;
    searchQuery?: string; // Make search query optional in props
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
    searchQuery,
    processingFiles
}: {
    node: TreeNode;
    level?: number;
    selectedFiles: Set<string>;
    onToggleDirectory: (path: string) => void;
    onToggleFile: (path: string) => void;
    expanded: Set<string>;
    onToggleExpand: (path: string) => void;
    searchQuery: string;
    processingFiles: Set<string>;
}) {
    // Calculate if all files in this directory and subdirectories are selected
    const allSelected = node.fileCount > 0 &&
        node.files.filter(f => f.isSelectable).every(f => selectedFiles.has(f.path)) &&
        Array.from(node.children.values()).every(child =>
            child.files.filter(f => f.isSelectable).every(f => selectedFiles.has(f.path)));

    // Calculate if some files are selected
    const someSelected = node.files.some(f => f.isSelectable && selectedFiles.has(f.path)) ||
        Array.from(node.children.values()).some(child =>
            child.files.some(f => f.isSelectable && selectedFiles.has(f.path)));

    const hasChildren = node.children.size > 0 || node.files.length > 0;
    const isExpanded = expanded.has(node.path);

    // Filter node contents based on search query
    const matchesSearch = searchQuery === '' ||
        node.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.files.some(f => f.path.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return null;

    // Count selectable files
    const selectableFileCount = node.files.filter(f => f.isSelectable).length;

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
                        className={`w-8 h-8 flex items-center justify-center ${hasChildren ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded' : ''
                            }`}
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
                        ({selectableFileCount} file{selectableFileCount !== 1 ? 's' : ''})
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
                                className={`flex items-center w-full hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-left ${!file.isSelectable ? 'opacity-60' : ''
                                    }`}
                                style={{ paddingLeft: `${(level + 1) * 16}px` }}
                            >
                                <div className="w-8 h-8" /> {/* Spacing for alignment */}
                                <div
                                    onClick={() => file.isSelectable && onToggleFile(file.path)}
                                    className={`p-2 ${file.isSelectable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                >
                                    {processingFiles.has(file.path) ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                    ) : file.isSelectable && selectedFiles.has(file.path) ? (
                                        <CheckSquare className="w-4 h-4 text-blue-500" />
                                    ) : (
                                        <Square className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                                <span className={`py-2 text-sm truncate ${file.isSelectable ? (file.isTextFile ? 'font-mono' : 'font-mono italic text-gray-500') : 'text-gray-400'}`}>
                                    {file.name}
                                    {!file.isSelectable && ' (unsupported)'}
                                    {!file.isTextFile && ' (non-text)'}
                                </span>
                                {file.size && (
                                    <span className="ml-auto text-gray-400 text-xs pr-4">
                                        {(file.size / 1024).toFixed(1)}KB
                                    </span>
                                )}
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
                            processingFiles={processingFiles}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function DirectoryTree({
    files,
    selectedFiles,
    onToggleDirectory,
    onToggleFile,
    processingFiles,
    searchQuery = '' // Provide default empty string
}: DirectoryTreeProps) {
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['/']));
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
        <div className="space-y-1 max-h-[calc(100vh-400px)] overflow-y-auto">
            <DirectoryTreeNode
                node={tree}
                selectedFiles={selectedFiles}
                onToggleDirectory={onToggleDirectory}
                onToggleFile={onToggleFile}
                expanded={expanded}
                onToggleExpand={handleToggleExpand}
                searchQuery={searchQuery}
                processingFiles={processingFiles}
            />
        </div>
    );
}