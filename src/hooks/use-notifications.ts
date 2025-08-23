import { useToast as useToastOriginal } from '@/components/ui/toast';

// Helper hook pro snadné nahrazování alert() volání
export const useNotifications = () => {
  const { success, error, warning, info } = useToastOriginal();

  return {
    // Success notifikace
    success: (message: string, description?: string) => {
      success(message, description);
    },
    
    // Error notifikace  
    error: (message: string, description?: string) => {
      error(message, description);
    },
    
    // Warning notifikace
    warning: (message: string, description?: string) => {
      warning(message, description);
    },
    
    // Info notifikace
    info: (message: string, description?: string) => {
      info(message, description);
    },
    
    // Alias pro jednoduché nahrazení alert()
    alert: (message: string) => {
      info('Oznámení', message);
    },
    
    // Alias pro confirm-like akce (ale bez return value)
    confirm: (message: string, onConfirm?: () => void) => {
      warning('Potvrzení', message);
      if (onConfirm) {
        setTimeout(onConfirm, 2000); // Auto-confirm po 2s
      }
    }
  };
};
