import React, { useState } from 'react';
import { useFileSystem } from '@/hooks/useFileSystem';
import { StatusAlert } from './status-alert';
import { DirectoryTree } from './directory-tree';
import { SelectedFilesList } from './selected-files-list'; 
import { ActionButtons } from './action-buttons';

export function FileContentCopier() {
  const [expandedPanels, setExpandedPanels] = useState<Set<string>>(new Set(['directory']));
  
  const {
    files,
    selectedFiles,
    status,
    loading,
    handleFolderSelect,
    toggleFile,
    toggleDirectory,
    copySelected,
    selectAll,
    deselectAll
  } = useFileSystem();

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
        {/* Directory Tree Section - 6 columns */}
        <div className="col-span-6 border rounded dark:border-gray-700">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Directory</h2>
            <DirectoryTree
              files={files}
              selectedFiles={selectedFiles}
              onToggleFile={toggleFile}
              onToggleDirectory={toggleDirectory}
            />
          </div>
        </div>

        {/* Selected Files Section - 6 columns */}
        <div className="col-span-6 border rounded dark:border-gray-700">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Selected Files</h2>
            <SelectedFilesList
              files={files}
              selectedFiles={selectedFiles}
              onToggleFile={toggleFile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}