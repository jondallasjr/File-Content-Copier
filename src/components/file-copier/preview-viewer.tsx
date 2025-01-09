import React from 'react';

interface PreviewViewerProps {
  generatePreviewContent: () => string;
}

export function PreviewViewer({ generatePreviewContent }: PreviewViewerProps) {
  const previewContent = generatePreviewContent();

  return (
    <div className="mt-4 border rounded p-4 bg-gray-50 dark:bg-gray-800">
      <h3 className="font-semibold mb-2">Preview</h3>
      <pre className="text-sm whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
        {previewContent || 'No files selected.'}
      </pre>
    </div>
  );
}