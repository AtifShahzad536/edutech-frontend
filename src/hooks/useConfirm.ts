import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  type?: 'danger' | 'success' | 'info';
  confirmText?: string;
  cancelText?: string;
}

export const useConfirm = () => {
  const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = useCallback(() => {
    setPromise(null);
    setOptions(null);
  }, []);

  const handleConfirm = useCallback(() => {
    promise?.resolve(true);
    handleClose();
  }, [promise, handleClose]);

  const handleCancel = useCallback(() => {
    promise?.resolve(false);
    handleClose();
  }, [promise, handleClose]);

  return {
    confirm,
    handleConfirm,
    handleCancel,
    isOpen: promise !== null,
    options
  };
};
