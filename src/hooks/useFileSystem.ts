import { useState, useCallback } from 'react';
import { FileInfo, Status } from '@/types/files';
import { isTextFile, formatFileContent, clearTextFileCache } from '@/lib/file-utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB size limit
const STATUS_TIMEOUT = 3000;

export function useFileSystem() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Status>({ message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState<string>('/');
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());

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
      clearTextFileCache(); // Clear the cache when selecting a new folder
      const dirHandle = await window.showDirectoryPicker();
      const newFiles: FileInfo[] = [];
      const skippedFiles: string[] = [];
      setProcessingFiles(new Set());

      const processDirectory = async (handle: FileSystemDirectoryHandle, path = '') => {
        for await (const entry of handle.values()) {
          const entryPath = path ? `${path}/${entry.name}` : entry.name;
          
          if (entry.kind === 'file') {
            const fileHandle = entry as FileSystemFileHandle;
            setProcessingFiles(prev => new Set(prev).add(entryPath));
            
            try {
              const file = await fileHandle.getFile();
              if (file.size > MAX_FILE_SIZE) {
                skippedFiles.push(`${entryPath} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
                continue;
              }

              // Check if it's a text file
              const isText = await isTextFile(fileHandle);
              
              const extension = entry.name.split('.').pop() || '';
              newFiles.push({
                name: entry.name,
                path: entryPath,
                handle: fileHandle,
                extension,
                size: file.size,
                isText
              });
            } catch (error) {
              console.error(`Error processing file ${entryPath}:`, error);
              skippedFiles.push(entryPath);
            } finally {
              setProcessingFiles(prev => {
                const next = new Set(prev);
                next.delete(entryPath);
                return next;
              });
            }
          } else if (entry.kind === 'directory') {
            const newHandle = await handle.getDirectoryHandle(entry.name);
            await processDirectory(newHandle, entryPath);
          }
        }
      };

      await processDirectory(dirHandle);
      setFiles(newFiles);
      setSelectedFiles(new Set());
      setDirectoryHandle(dirHandle);
      setCurrentDirectory('/');

      const textFileCount = newFiles.filter(f => f.isText).length;
      const nonTextFileCount = newFiles.length - textFileCount;
      
      if (skippedFiles.length > 0) {
        updateStatus(
          `Loaded ${textFileCount} text files. Skipped ${skippedFiles.length} files (${nonTextFileCount} non-text, ${skippedFiles.length - nonTextFileCount} too large)`,
          'warning'
        );
        console.log('Skipped files:', skippedFiles);
      } else {
        updateStatus(
          `Loaded ${textFileCount} text files${nonTextFileCount > 0 ? ` (${nonTextFileCount} non-text files excluded)` : ''}`,
          'success'
        );
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        updateStatus(`Error loading folder: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [updateStatus]);

  const toggleFile = useCallback((path: string) => {
    const file = files.find(f => f.path === path);
    if (!file?.isText) return; // Only allow toggling text files

    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, [files]);

  const toggleDirectory = useCallback((directory: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      const directoryFiles = getFilesInDirectory(directory);
      
      // Only consider text files
      const textFiles = directoryFiles.filter(f => f.isText);
      
      // Check if all text files in this directory and subdirectories are selected
      const allSelected = textFiles.every(f => prev.has(f.path));
      
      // Toggle all text files in this directory and subdirectories
      textFiles.forEach(file => {
        if (allSelected) {
          next.delete(file.path);
        } else {
          next.add(file.path);
        }
      });
      
      return next;
    });
  }, [files, getFilesInDirectory]);

  const copySelected = async () => {
    if (selectedFiles.size === 0) {
      updateStatus('No files selected', 'warning');
      return;
    }

    try {
      setLoading(true);
      const contents: string[] = [];

      for (const file of files) {
        if (selectedFiles.has(file.path) && file.isText) {
          try {
            const fileHandle = await file.handle.getFile();
            const content = await fileHandle.text();
            contents.push(formatFileContent(file.path, content));
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
    setSelectedFiles(new Set(files.filter(f => f.isText).map(f => f.path)));
  }, [files]);

  const deselectAll = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  return {
    files,
    selectedFiles,
    status,
    loading,
    currentDirectory,
    processingFiles,
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
    getSubdirectories
  };
}