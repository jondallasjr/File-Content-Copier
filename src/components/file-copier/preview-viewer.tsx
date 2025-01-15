import React, { useEffect, useState } from 'react';
import { FileInfo } from '@/types/files';
import { generateFileStructure } from '@/lib/utils';

interface PreviewViewerProps {
  generatePreviewContent: () => string;
  selectedFiles: Set<string>;
  files: FileInfo[];
  onCombinedContentChange: (content: string) => void;
}

export function PreviewViewer({ generatePreviewContent, selectedFiles, files, onCombinedContentChange }: PreviewViewerProps) {
  const [combinedContent, setCombinedContent] = useState<string>('');

  useEffect(() => {
    const fileStructure = generateFileStructure(files, selectedFiles);
    const fileContents = generatePreviewContent();
    const combined = `${fileStructure}\n\n${fileContents}`;
    setCombinedContent(combined);
    onCombinedContentChange(combined); // Notify parent of combined content
  }, [generatePreviewContent, files, selectedFiles, onCombinedContentChange]);

  return (
    <div className="mt-4 border rounded p-4 bg-gray-50 dark:bg-gray-800">
      <h3 className="font-semibold mb-2">Preview</h3>
      <pre className="text-sm whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
        {combinedContent || 'No files selected.'}
      </pre>
    </div>
  );
}