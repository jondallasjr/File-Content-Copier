import React, { useState } from 'react';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from 'lucide-react';
import { useFileSystem } from '@/hooks/useFileSystem';
import { StatusAlert } from './status-alert';
import { DirectoryTree } from './directory-tree';
import { GroupedExtensionsList } from './grouped-extensions-list';
import { FileList } from './file-list';
import { ActionButtons } from './action-buttons';
import { QUICK_SELECT_PATTERNS } from '@/lib/constants';

export function FileContentCopier() {
  const [expandedPanels, setExpandedPanels] = useState<Set<string>>(new Set(['directories']));
  
  const {
    files,
    selectedFiles,
    extensions,
    status,
    loading,
    handleFolderSelect,
    toggleExtension,
    toggleFile,
    toggleDirectory,
    copySelected,
    selectAll,
    deselectAll
  } = useFileSystem();

  const togglePanel = (panel: string) => {
    setExpandedPanels(prev => {
      const next = new Set(prev);
      if (next.has(panel)) {
        next.delete(panel);
      } else {
        next.add(panel);
      }
      return next;
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <ActionButtons
          onFolderSelect={handleFolderSelect}
          onCopySelected={copySelected}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          selectedCount={selectedFiles.size}
          totalFiles={files.length}
          loading={loading}
        />
      </div>

      {status.message && <StatusAlert status={status} />}

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          {/* File System Navigation */}
          <div className="space-y-4">
            {/* Directories Panel */}
            <div className="border rounded dark:border-gray-700">
              <button
                onClick={() => togglePanel('directories')}
                className="w-full px-4 py-2 text-left font-semibold flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <span>Directories</span>
                <ChevronDownIcon
                  className={`w-5 h-5 transition-transform ${
                    expandedPanels.has('directories') ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {expandedPanels.has('directories') && (
                <DirectoryTree
                  files={files}
                  selectedFiles={selectedFiles}
                  onToggleDirectory={toggleDirectory}
                />
              )}
            </div>

            {/* Extensions Panel */}
            <div className="border rounded dark:border-gray-700">
              <button
                onClick={() => togglePanel('extensions')}
                className="w-full px-4 py-2 text-left font-semibold flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <span>Extensions</span>
                <ChevronDownIcon
                  className={`w-5 h-5 transition-transform ${
                    expandedPanels.has('extensions') ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {expandedPanels.has('extensions') && (
                <GroupedExtensionsList
                  extensions={extensions}
                  files={files}
                  selectedFiles={selectedFiles}
                  onToggleExtension={toggleExtension}
                />
              )}
            </div>
          </div>
        </div>

        <div className="col-span-9">
          <FileList
            files={files}
            selectedFiles={selectedFiles}
            onToggleFile={toggleFile}
          />
        </div>
      </div>
    </div>
  );
}