import React from 'react';
import { FileInfo } from '@/types/files';

interface PreviewViewerProps {
  selectedFiles: Set<string>;
  files: FileInfo[];
  generatePreviewContent: () => string;
}

export function PreviewViewer({ selectedFiles, files, generatePreviewContent }: PreviewViewerProps) {
  const previewContent = generatePreviewContent();

  return (
    <div className="mt-4 border rounded p-4 bg-gray-50 dark:bg-gray-800">
      <h3 className="font-semibold mb-2">Preview</h3>
      <pre className="text-sm whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
        {previewContent || 'No files selected.'}
      </pre>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Selected files: {Array.from(selectedFiles).join(', ')}
      </div>
    </div>
  );
}