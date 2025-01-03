import { useState, useCallback } from 'react';
import { FileInfo, Status } from '@/types/files';
import { PREFERRED_EXTENSIONS } from '@/lib/constants'; 

const STATUS_TIMEOUT = 3000;

export function useFileSystem() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectedExtensions, setSelectedExtensions] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Status>({ message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState<string>('/');
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());
  const [totalFiles, setTotalFiles] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);

  const updateStatus = useCallback((message: string, type: Status['type'] = 'info') => {
    setStatus({ message, type });
    if (type !== 'error') {
      setTimeout(() => setStatus({ message: '', type: 'info' }), STATUS_TIMEOUT);
    }
  }, []);

  // Helper function to get all files under a directory path (including subdirectories)
  const getFilesInDirectory = useCallback((directory: string) => {
    return files.filter(file => {
      const dirPath = directory === '/' ? '' : directory;
      return file.path.startsWith(dirPath + '/');
    });
  }, [files]);

  // Helper function to get immediate files in a directory (no subdirectories)
  const getImmediateFilesInDirectory = useCallback((directory: string) => {
    return files.filter(file => {
      const dirPath = directory === '/' ? '' : directory;
      const relativePath = file.path.slice(dirPath.length + 1);
      return file.path.startsWith(dirPath + '/') && !relativePath.includes('/');
    });
  }, [files]);

  // Helper function to get all subdirectories under a directory
  const getSubdirectories = useCallback((directory: string) => {
    const dirs = new Set<string>();
    files.forEach(file => {
      const dirPath = directory === '/' ? '' : directory;
      if (file.path.startsWith(dirPath + '/')) {
        const relativePath = file.path.slice(dirPath.length + 1);
        const parts = relativePath.split('/');
        if (parts.length > 1) {
          dirs.add(dirPath + '/' + parts[0]);
        }
      }
    });
    return Array.from(dirs);
  }, [files]);

  const handleFolderSelect = useCallback(async () => {
    try {
      setLoading(true);
      setProcessedFiles(0);
      setTotalFiles(0);
      setProcessingFiles(new Set());

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
          setProcessingFiles(prev => new Set(Array.from(prev).concat(entryPath)));

          try {
            if (entry.kind === 'file') {
              const fileHandle = entry as FileSystemFileHandle;
              const file = await fileHandle.getFile();
              const extension = entry.name.split('.').pop()?.toLowerCase() || '(no extension)';

              newFiles.push({
                name: entry.name,
                path: entryPath,
                handle: fileHandle,
                extension,
                size: file.size,
                isSelectable: true // All files are selectable
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
      setSelectedFiles(new Set());
      setCurrentDirectory('/');

      // Auto-select preferred extensions
      const preferredExtensions = new Set(
        newFiles
          .map(file => file.extension)
          .filter(extension => PREFERRED_EXTENSIONS.has(extension))
      );
      setSelectedExtensions(preferredExtensions);

      updateStatus(`Found ${newFiles.length} files`, 'success');
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        updateStatus(`Error loading folder: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
      setProcessingFiles(new Set());
    }
  }, [updateStatus]);

  const toggleFile = useCallback((path: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const toggleDirectory = useCallback((directory: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      const directoryFiles = getFilesInDirectory(directory);

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
  }, [getFilesInDirectory]);

  const copySelected = async () => {
    if (selectedFiles.size === 0) {
      updateStatus('No files selected', 'warning');
      return;
    }

    try {
      setLoading(true);
      const contents: string[] = [];

      for (const file of files) {
        if (selectedFiles.has(file.path)) {
          try {
            const fileHandle = await file.handle.getFile();
            const content = await fileHandle.text();
            contents.push(`=== START ${file.path} ===\n${content}\n=== END ${file.path} ===\n\n`);
          } catch (error) {
            updateStatus(`Error reading ${file.path}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'warning');
          }
        }
      }

      if (contents.length > 0) {
        await navigator.clipboard.writeText(contents.join(''));
        updateStatus(`Copied ${contents.length} files to clipboard`, 'success');
      }
    } catch (error) {
      updateStatus(`Error copying to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectAll = useCallback(() => {
    setSelectedFiles(new Set(files.map(f => f.path)));
  }, [files]);

  const deselectAll = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  return {
    files,
    selectedFiles,
    selectedExtensions, 
    setSelectedExtensions, 
    status,
    loading,
    currentDirectory,
    processingFiles,
    totalFiles,
    processedFiles,
    handleFolderSelect,
    toggleFile,
    toggleDirectory,
    copySelected,
    selectAll,
    deselectAll,
    updateStatus,
    setCurrentDirectory,
    getFilesInDirectory,
    getImmediateFilesInDirectory,
    getSubdirectories,
  };
}