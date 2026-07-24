import React from 'react';
import { AlertCircle, CheckCircle2, Info, HelpCircle, X } from 'lucide-react';

export interface ModalOptions {
  title: string;
  message: string;
  type?: 'confirm' | 'info' | 'success' | 'warning' | 'danger';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ConfirmModalProps {
  isOpen: boolean;
  options: ModalOptions | null;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, options, onClose }) => {
  if (!isOpen || !options) return null;

  const {
    title,
    message,
    type = 'confirm',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel
  } = options;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  const isAlertOnly = type === 'info' || type === 'success' || type === 'warning';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              type === 'danger' ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600' :
              type === 'success' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' :
              type === 'warning' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600' :
              'bg-primary/10 text-primary'
            }`}>
              {type === 'danger' && <AlertCircle className="h-6 w-6" />}
              {type === 'success' && <CheckCircle2 className="h-6 w-6" />}
              {type === 'warning' && <AlertCircle className="h-6 w-6" />}
              {type === 'info' && <Info className="h-6 w-6" />}
              {type === 'confirm' && <HelpCircle className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base leading-snug">
                {title}
              </h3>
            </div>
          </div>
          <button 
            onClick={handleCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Message */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {!isAlertOnly && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all hover:scale-105 ${
              type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' :
              type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' :
              type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' :
              'bg-primary hover:bg-primary/90 shadow-primary/20'
            }`}
          >
            {isAlertOnly ? (confirmText === 'Confirm' ? 'OK' : confirmText) : confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};
