import React, { useState } from 'react';
import { useFileSystem } from '@/hooks/useFileSystem';
import { StatusAlert } from './status-alert';
import { DirectoryTree } from './directory-tree';
import { SelectedFilesList } from './selected-files-list';
import { ActionButtons } from './action-buttons';
import { Welcome } from './welcome';
import { ExtensionFilter } from './extension-filter';
import { SearchBox } from './search-box';

export function FileContentCopier() {
  const [extensionFilter, setExtensionFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    files,
    selectedFiles,
    status,
    loading,
    processingFiles,
    handleFolderSelect,
    toggleFile,
    toggleDirectory,
    copySelected,
    selectAll,
    deselectAll
  } = useFileSystem();

  const filteredFiles = files.filter(file => {
    if (!file.isText) return false;
    
    const matchesExtension = !extensionFilter || file.extension === extensionFilter;
    const matchesSearch = !searchQuery || 
      file.path.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesExtension && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Welcome />
      
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <ActionButtons
          onFolderSelect={handleFolderSelect}
          onCopySelected={copySelected}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          selectedCount={selectedFiles.size}
          totalFiles={filteredFiles.length}
          loading={loading}
        />
      </div>

      {status.message && <StatusAlert status={status} />}

      <div className="grid grid-cols-12 gap-4">
        {/* Directory Tree Section - 6 columns */}
        <div className="col-span-6 border rounded dark:border-gray-700">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Directory</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <SearchBox
                    onSearch={setSearchQuery}
                    disabled={loading}
                    placeholder="Search files..."
                  />
                </div>
                <div className="w-48">
                  <ExtensionFilter
                    files={files}
                    onFilterChange={setExtensionFilter}
                  />
                </div>
              </div>
              
              <DirectoryTree
                files={filteredFiles}
                selectedFiles={selectedFiles}
                onToggleFile={toggleFile}
                onToggleDirectory={toggleDirectory}
                processingFiles={processingFiles}
              />
            </div>
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