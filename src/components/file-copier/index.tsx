import React from 'react';
import { useFileSystem } from '@/hooks/useFileSystem';
import { StatusAlert } from './status-alert';
import { ExtensionList } from './extension-list';
import { FileList } from './file-list';
import { ActionButtons } from './action-buttons';

export function FileContentCopier() {
  const {
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
  } = useFileSystem();

  return (
    <div className="max-w-6xl mx-auto">
      <ActionButtons
        onFolderSelect={handleFolderSelect}
        onCopySelected={copySelected}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        selectedCount={selectedFiles.size}
        totalFiles={files.length}
        loading={loading}
      />

      {status.message && <StatusAlert status={status} />}

      <div className="grid grid-cols-4 gap-4">
        <ExtensionList
          extensions={extensions}
          files={files}
          selectedFiles={selectedFiles}
          onToggleExtension={toggleExtension}
        />
        <FileList
          files={files}
          selectedFiles={selectedFiles}
          onToggleFile={toggleFile}
        />
      </div>
    </div>
  );
}