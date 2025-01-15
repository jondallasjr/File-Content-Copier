import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FileInfo } from '@/types/files';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Ensure this function is exported
export function generateFileStructure(files: FileInfo[], selectedFiles: Set<string>): string {
  const root: Record<string, any> = {};

  // Build the tree structure
  selectedFiles.forEach((path) => {
    const parts = path.split('/');
    let currentLevel = root;

    parts.forEach((part, index) => {
      if (!currentLevel[part]) {
        currentLevel[part] = {};
      }
      currentLevel = currentLevel[part];
    });
  });

  // Convert the tree to a string representation
  const buildTree = (node: Record<string, any>, prefix = ''): string => {
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