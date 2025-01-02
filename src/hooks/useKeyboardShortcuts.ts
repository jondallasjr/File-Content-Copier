import { useEffect } from 'react';

export function useKeyboardShortcuts({
  onSelectAll,
  onCopy,
  onEscape,
}: {
  onSelectAll: () => void;
  onCopy: () => void;
  onEscape: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if we're in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Select all: Cmd/Ctrl + A
      if ((event.metaKey || event.ctrlKey) && event.key === 'a') {
        event.preventDefault();
        onSelectAll();
      }

      // Copy: Cmd/Ctrl + C (when files are selected)
      if ((event.metaKey || event.ctrlKey) && event.key === 'c') {
        event.preventDefault();
        onCopy();
      }

      // Escape: clear selection or search
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectAll, onCopy, onEscape]);
}