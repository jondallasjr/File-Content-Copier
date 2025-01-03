import React from 'react';
import { Alert } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface LoadingProgressProps {
  totalFiles: number;
  processedFiles: number;
  currentlyProcessing: Set<string>;
}

export function LoadingProgress({ 
  totalFiles, 
  processedFiles,
  currentlyProcessing 
}: LoadingProgressProps) {
  const percentage = totalFiles === 0 ? 0 : Math.round((processedFiles / totalFiles) * 100);
  const recentFiles = Array.from(currentlyProcessing).slice(-2); // Show last 2 files being processed

  return (
    <Alert className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="font-medium text-blue-800 dark:text-blue-200">
            Loading directory...
          </span>
          <span className="text-blue-600 dark:text-blue-300">
            {processedFiles} of {totalFiles} files ({percentage}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full bg-blue-100 dark:bg-blue-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Currently processing files */}
        {recentFiles.length > 0 && (
          <div className="text-sm text-blue-600 dark:text-blue-300 font-mono">
            {recentFiles.map(file => (
              <div key={file} className="truncate">
                Analyzing: {file}
              </div>
            ))}
          </div>
        )}
      </div>
    </Alert>
  );
}