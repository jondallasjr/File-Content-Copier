import { useState, useCallback, useEffect } from 'react';
import { FileInfo, Status } from '@/types/files';
import { PREFERRED_EXTENSIONS } from '@/lib/constants';
import { generateFileStructure } from '@/lib/utils';

const STATUS_TIMEOUT = 3000;

export function useFileSystem() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Status>({ message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());
  const [totalFiles, setTotalFiles] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);
  const [ignoredFolders, setIgnoredFolders] = useState<string[]>([
    'node_modules', '.next', '.git', 'dist', 'build', '.vscode', '.idea',
    'package-lock.json', 'yarn.lock', '.env', '.DS_Store', '*.log'
  ]);

  // Load ignored folders from localStorage on mount
  useEffect(() => {
    const savedIgnoredFolders = localStorage.getItem('ignoredFolders');
    if (savedIgnoredFolders) {
      setIgnoredFolders(JSON.parse(savedIgnoredFolders));
    }
  }, []);

  // Save ignored folders to localStorage when they change
  useEffect(() => {
    localStorage.setItem('ignoredFolders', JSON.stringify(ignoredFolders));
  }, [ignoredFolders]);

  // Helper function to check if a path is in an ignored folder
  const isPathIgnored = useCallback(
    (path: string) => {
      return ignoredFolders.some(folder => path.includes(`/${folder}/`) || path.startsWith(`${folder}/`));
    },
    [ignoredFolders]
  );

  const updateStatus = useCallback((message: string, type: Status['type'] = 'info') => {
    setStatus({ message, type });
    if (type !== 'error') {
      setTimeout(() => setStatus({ message: '', type: 'info' }), STATUS_TIMEOUT);
    }
  }, []);

  // Handle folder selection
  const handleFolderSelect = useCallback(async () => {
    try {
      setLoading(true);
      setProcessedFiles(0);
      setTotalFiles(0);
      setProcessingFiles(new Set());
      setFiles([]); // Clear existing files

      const dirHandle = await window.showDirectoryPicker();
      const newFiles: FileInfo[] = [];
      let totalEntries = 0;
      let processedEntries = 0;

      const processDirectory = async (handle: FileSystemDirectoryHandle, path = '') => {
        const entries = [];
        for await (const entry of handle.values()) {
          entries.push(entry);
        }

        totalEntries += entries.length;
        setTotalFiles(totalEntries);

        for (const entry of entries) {
          const entryPath = path ? `${path}/${entry.name}` : entry.name;

          // Skip if the entry is in an ignored folder
          if (isPathIgnored(entryPath)) {
            processedEntries++;
            setProcessedFiles(processedEntries);
            continue;
          }

          setProcessingFiles(prev => new Set(Array.from(prev).concat(entryPath)));

          try {
            if (entry.kind === 'file') {
              const fileHandle = entry as FileSystemFileHandle;
              const file = await fileHandle.getFile();
              const extension = entry.name.split('.').pop()?.toLowerCase() || '(no extension)';
              const isTextFile = file.type.startsWith('text/') || PREFERRED_EXTENSIONS.has(extension);
              const content = isTextFile ? await file.text() : ''; // Read file content

              newFiles.push({
                name: entry.name,
                path: entryPath,
                handle: fileHandle,
                extension,
                size: file.size,
                isSelectable: true,
                isTextFile,
                content, // Add content to FileInfo
              });
            } else if (entry.kind === 'directory') {
              const newHandle = await handle.getDirectoryHandle(entry.name);
              await processDirectory(newHandle, entryPath);
            }
          } finally {
            processedEntries++;
            setProcessedFiles(processedEntries);
            setProcessingFiles(prev => {
              const next = new Set(prev);
              next.delete(entryPath);
              return next;
            });
          }
        }
      };

      await processDirectory(dirHandle);
      setFiles(newFiles);
      updateStatus(`Found ${newFiles.length} files`, 'success');
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        updateStatus(`Error loading folder: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
      setProcessingFiles(new Set());
    }
  }, [updateStatus, isPathIgnored]);

  // Toggle selection of a single file
  const toggleFile = useCallback(
    (path: string) => {
      setSelectedFiles(prev => {
        const next = new Set(prev);
        if (next.has(path)) {
          next.delete(path);
        } else {
          next.add(path);
        }
        return next;
      });
    },
    []
  );

  // Toggle selection of all files in a directory (only text files)
  const toggleDirectory = useCallback(
    (directory: string) => {
      setSelectedFiles(prev => {
        const next = new Set(prev);
        const directoryFiles = files.filter(file => 
          file.path.startsWith(`${directory}/`) && 
          PREFERRED_EXTENSIONS.has(file.extension) &&
          !ignoredFolders.some(ignored => file.path.includes(ignored))
        );
  
        // Check if all files in this directory and subdirectories are selected
        const allSelected = directoryFiles.every(f => prev.has(f.path));
  
        // Toggle all files in this directory and subdirectories
        directoryFiles.forEach(file => {
          if (allSelected) {
            next.delete(file.path);
          } else {
            next.add(file.path);
          }
        });
  
        return next;
      });
    },
    [files, ignoredFolders]
  );

  // Select all files (only text files)
  const selectAll = useCallback(() => {
    const textFiles = files.filter(file => 
      PREFERRED_EXTENSIONS.has(file.extension) && 
      !ignoredFolders.some(ignored => file.path.includes(ignored))
    );
    setSelectedFiles(new Set(textFiles.map(f => f.path)));
  }, [files, ignoredFolders]);

  useEffect(() => {
    if (!loading && processedFiles === totalFiles && totalFiles > 0) {
      selectAll(); // Automatically select all valid files after processing
    }
  }, [loading, processedFiles, totalFiles, selectAll]);

  // Deselect all files
  const deselectAll = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  // Copy selected fragments to clipboard
  const copySelected = async (combinedContent: string) => { // Accept combinedContent as a parameter
    if (selectedFiles.size === 0) {
      updateStatus('No files selected', 'warning');
      return;
    }
  
    try {
      await navigator.clipboard.writeText(combinedContent); // Copy the combined content
      updateStatus(`Copied ${selectedFiles.size} files to clipboard`, 'success');
    } catch (error) {
      updateStatus(`Error copying to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  // Generate preview content
  const generatePreviewContent = useCallback(() => {
    return files
      .filter(file => selectedFiles.has(file.path))
      .map(file => `=== START ${file.path} ===\n${file.content}\n=== END ${file.path} ===\n\n`)
      .join('');
  }, [files, selectedFiles]);

  return {
    files,
    selectedFiles,
    status,
    loading,
    processingFiles,
    totalFiles,
    processedFiles,
    ignoredFolders,
    setIgnoredFolders,
    handleFolderSelect,
    toggleFile,
    toggleDirectory,
    copySelected,
    selectAll,
    deselectAll,
    generatePreviewContent,
    updateStatus,
  };
}