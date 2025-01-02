import { useState, useCallback, useEffect } from 'react';
import { FileInfo, Status, ExtensionMap } from '@/types/files';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB size limit
const STATUS_TIMEOUT = 3000; // Configurable status message timeout

export function useFileSystem() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [extensions, setExtensions] = useState<ExtensionMap>(new Map());
  const [status, setStatus] = useState<Status>({ message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);

  const updateStatus = useCallback((message: string, type: Status['type'] = 'info') => {
    setStatus({ message, type });
    if (type !== 'error') {
      setTimeout(() => setStatus({ message: '', type: 'info' }), STATUS_TIMEOUT);
    }
  }, []);

  // Load saved directory handle on mount
  useEffect(() => {
    const loadSavedHandle = async () => {
      try {
        const savedHandle = localStorage.getItem('lastDirectoryHandle');
        if (savedHandle) {
          const handle = await window.showDirectoryPicker();
          // Verify we still have permission
          const permission = await handle.queryPermission({ mode: 'read' });
          if (permission !== 'granted') {
            const newPermission = await handle.requestPermission({ mode: 'read' });
            if (newPermission !== 'granted') {
              throw new Error('Permission denied');
            }
          }
          setDirectoryHandle(handle);
        }
      } catch (error) {
        console.log('Failed to restore directory access:', error);
        localStorage.removeItem('lastDirectoryHandle');
      }
    };
    loadSavedHandle();
  }, []);

  const handleFolderSelect = async () => {
    try {
      setLoading(true);
      const dirHandle = await window.showDirectoryPicker();
      const newFiles: FileInfo[] = [];
      const newExtensions = new Map<string, number>();
      const skippedFiles: string[] = [];

      const processDirectory = async (handle: FileSystemDirectoryHandle, path = '') => {
        for await (const entry of handle.values()) {
          const entryPath = path ? `${path}/${entry.name}` : entry.name;
          
          if (entry.kind === 'file') {
            const extension = entry.name.split('.').pop() || '';
            const fileHandle = entry as FileSystemFileHandle;
            
            try {
              const file = await fileHandle.getFile();
              if (file.size > MAX_FILE_SIZE) {
                skippedFiles.push(`${entryPath} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
                continue;
              }
              
              newFiles.push({
                name: entry.name,
                path: entryPath,
                handle: fileHandle,
                extension,
                size: file.size
              });
              
              const count = newExtensions.get(extension) || 0;
              newExtensions.set(extension, count + 1);
            } catch (error) {
              console.error(`Error processing file ${entryPath}:`, error);
              skippedFiles.push(entryPath);
            }
          } else if (entry.kind === 'directory') {
            const newHandle = await handle.getDirectoryHandle(entry.name);
            await processDirectory(newHandle, entryPath);
          }
        }
      };

      await processDirectory(dirHandle);
      setFiles(newFiles);
      setExtensions(newExtensions);
      setSelectedFiles(new Set());
      setDirectoryHandle(dirHandle);
      
      // Save directory handle
      try {
        localStorage.setItem('lastDirectoryHandle', 'true');
      } catch (error) {
        console.error('Error saving directory handle:', error);
      }

      if (skippedFiles.length > 0) {
        updateStatus(`Loaded ${newFiles.length} files. Skipped ${skippedFiles.length} files (size > 50MB)`, 'warning');
        console.log('Skipped files:', skippedFiles);
      } else {
        updateStatus(`Loaded ${newFiles.length} files successfully`, 'success');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        updateStatus(`Error loading folder: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleExtension = useCallback((extension: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      const extensionFiles = files.filter(f => f.extension === extension);
      
      const allSelected = extensionFiles.every(f => prev.has(f.path));
      extensionFiles.forEach(file => {
        if (allSelected) {
          next.delete(file.path);
        } else {
          next.add(file.path);
        }
      });
      
      return next;
    });
  }, [files]);

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
            contents.push(`=== ${file.path} ===\n${content}\n`);
          } catch (error) {
            updateStatus(`Error reading ${file.path}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'warning');
          }
        }
      }

      if (contents.length > 0) {
        await navigator.clipboard.writeText(contents.join('\n'));
        updateStatus(`Copied ${contents.length} files to clipboard`, 'success');
      }
    } catch (error) {
      updateStatus(`Error copying to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectAll = () => {
    setSelectedFiles(new Set(files.map(f => f.path)));
  };

  const deselectAll = () => {
    setSelectedFiles(new Set());
  };

  return {
    files,
    selectedFiles,
    extensions,
    status,
    loading,
    handleFolderSelect,
    toggleExtension,
    toggleFile,
    copySelected,
    selectAll,
    deselectAll,
    updateStatus
  };
}