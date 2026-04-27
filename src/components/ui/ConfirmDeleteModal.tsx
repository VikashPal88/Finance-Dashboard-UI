'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Loader2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Transaction",
  description = "Are you sure you want to delete this transaction? This action cannot be undone."
}: ConfirmDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm p-6 rounded-2xl border shadow-2xl relative overflow-hidden"
            style={{ backgroundColor: 'var(--dropdown-bg)', borderColor: 'var(--glass-border)' }}
          >
            {/* Background Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-expense to-rose-400" />

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-expense/10 flex items-center justify-center mb-4">
                <Trash2 size={28} className="text-expense" />
              </div>

              <h3 className="text-xl font-bold mb-2">{title}</h3>
              <p className="text-sm text-[var(--muted)] mb-6">
                {description}
              </p>

              <div className="flex w-full gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-colors hover:bg-[var(--surface-hover)] border disabled:opacity-50"
                  style={{ borderColor: 'var(--glass-border)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-expense hover:bg-expense/90 transition-colors shadow-lg shadow-expense/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Yes, Delete'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
