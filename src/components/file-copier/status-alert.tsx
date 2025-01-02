import { AlertCircle, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Status } from '@/types/files';

interface StatusAlertProps {
  status: Status;
}

export function StatusAlert({ status }: StatusAlertProps) {
  if (!status.message) return null;

  return (
    <Alert className={`mb-4 ${
      status.type === 'error' ? 'bg-red-50 border-red-200' :
      status.type === 'success' ? 'bg-green-50 border-green-200' :
      status.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
      'bg-blue-50 border-blue-200'
    }`}>
      <AlertDescription className="flex items-center gap-2">
        {status.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
        {status.type === 'success' && <Check className="w-4 h-4 text-green-500" />}
        {status.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
        {status.message}
      </AlertDescription>
    </Alert>
  );
}