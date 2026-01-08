import { toast } from 'sonner';

export interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class NotificationService {
  // Success notifications
  success(message: string, options?: NotificationOptions) {
    return toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
    });
  }

  // Error notifications
  error(message: string, options?: NotificationOptions) {
    return toast.error(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      action: options?.action,
    });
  }

  // Info notifications
  info(message: string, options?: NotificationOptions) {
    return toast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
    });
  }

  // Warning notifications
  warning(message: string, options?: NotificationOptions) {
    return toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
    });
  }

  // Loading notifications
  loading(message: string, options?: Omit<NotificationOptions, 'action'>) {
    return toast.loading(message, {
      description: options?.description,
      duration: options?.duration,
    });
  }

  // Promise notifications (for async operations)
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) {
    return toast.promise(promise, messages);
  }

  // Dismiss a specific toast
  dismiss(toastId?: string | number) {
    return toast.dismiss(toastId);
  }

  // Dismiss all toasts
  dismissAll() {
    return toast.dismiss();
  }

  // Common notification patterns
  copySuccess(item: string = 'Text') {
    this.success(`${item} copied to clipboard!`, {
      duration: 2000,
    });
  }

  copyError() {
    this.error('Failed to copy to clipboard', {
      description: 'Please try again or copy manually',
    });
  }

  saveSuccess(item: string = 'Item') {
    this.success(`${item} saved successfully!`);
  }

  saveError(item: string = 'Item') {
    this.error(`Failed to save ${item.toLowerCase()}`, {
      description: 'Please check your input and try again',
    });
  }

  deleteSuccess(item: string = 'Item') {
    this.success(`${item} deleted successfully!`);
  }

  deleteError(item: string = 'Item') {
    this.error(`Failed to delete ${item.toLowerCase()}`, {
      description: 'Please try again later',
    });
  }

  createSuccess(item: string = 'Item') {
    this.success(`${item} created successfully!`);
  }

  createError(item: string = 'Item', error?: string) {
    this.error(`Failed to create ${item.toLowerCase()}`, {
      description: error || 'Please check your input and try again',
    });
  }

  updateSuccess(item: string = 'Item') {
    this.success(`${item} updated successfully!`);
  }

  updateError(item: string = 'Item') {
    this.error(`Failed to update ${item.toLowerCase()}`, {
      description: 'Please try again later',
    });
  }

  loadError(item: string = 'Data') {
    this.error(`Failed to load ${item.toLowerCase()}`, {
      description: 'Please refresh the page or try again later',
    });
  }

  networkError() {
    this.error('Network error', {
      description: 'Please check your internet connection and try again',
    });
  }

  validationError(message: string = 'Please check your input') {
    this.error('Validation error', {
      description: message,
    });
  }
}

// Export singleton instance
export const notify = new NotificationService();

// Export individual methods for convenience
export const {
  success,
  error,
  info,
  warning,
  loading,
  promise,
  dismiss,
  dismissAll,
  copySuccess,
  copyError,
  saveSuccess,
  saveError,
  deleteSuccess,
  deleteError,
  createSuccess,
  createError,
  updateSuccess,
  updateError,
  loadError,
  networkError,
  validationError,
} = notify;