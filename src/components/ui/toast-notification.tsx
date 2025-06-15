
import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastNotificationProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const ToastNotification = ({
  type,
  message,
  onClose,
  autoClose = true,
  duration = 4000
}: ToastNotificationProps) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  };

  const colors = {
    success: 'bg-green-100 text-green-800 border-green-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const Icon = icons[type];

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-in-right',
      colors[type]
    )}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-black/10 rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
