import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FileInfo } from '@/types/files';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Define a proper type for the tree structure
type TreeNode = {
  [key: string]: TreeNode;
};

export function generateFileStructure(files: FileInfo[], selectedFiles: Set<string>): string {
  const root: TreeNode = {};

  // Build the tree structure
  selectedFiles.forEach((path) => {
    const parts = path.split('/');
    let currentLevel = root;

    parts.forEach((part) => {
      if (!currentLevel[part]) {
        currentLevel[part] = {};
      }
      currentLevel = currentLevel[part];
    });
  });

  // Convert the tree to a string representation
  const buildTree = (node: TreeNode, prefix = ''): string => {
    const keys = Object.keys(node);
    return keys
      .map((key, i) => {
        const isLast = i === keys.length - 1;
        const linePrefix = isLast ? '└── ' : '├── ';
        const childPrefix = isLast ? '    ' : '│   ';

        const line = `${prefix}${linePrefix}${key}`;
        const children = buildTree(node[key], `${prefix}${childPrefix}`);

        return `${line}\n${children}`;
      })
      .join('');
  };

  return buildTree(root).trim();
}