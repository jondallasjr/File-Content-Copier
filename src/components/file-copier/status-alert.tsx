// src/components/file-copier/status-alert.tsx
import { AlertCircle, Check, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Status } from '@/types/files';

interface StatusAlertProps {
  status: Status;
}

export function StatusAlert({ status }: StatusAlertProps) {
  if (!status.message) return null;

  const getAlertStyles = (type: Status['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
  };

  const getIcon = (type: Status['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />;
      case 'success':
        return <Check className="w-4 h-4 text-green-500 dark:text-green-400" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
    }
  };

  return (
    <Alert className={`mb-4 ${getAlertStyles(status.type)}`}>
      <AlertDescription className="flex items-center gap-2">
        {getIcon(status.type)}
        <span className="font-medium">{status.message}</span>
      </AlertDescription>
    </Alert>
  );
}