import React from 'react';
import { FiX, FiAlertTriangle, FiCheck } from 'react-icons/fi';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'success' | 'info';
  confirmText?: string;
  cancelText?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: <FiAlertTriangle className="h-6 w-6 text-red-500" />,
      buttonClass: 'bg-red-600 hover:bg-red-700 shadow-red-600/20 text-white',
      accentColor: 'border-red-500/20'
    },
    success: {
      icon: <FiCheck className="h-6 w-6 text-emerald-500" />,
      buttonClass: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 text-white',
      accentColor: 'border-emerald-500/20'
    },
    info: {
      icon: <FiCheck className="h-6 w-6 text-indigo-500" />,
      buttonClass: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 text-white',
      accentColor: 'border-indigo-500/20'
    }
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className={`relative w-full max-w-md bg-[#0a0a0b] border ${config.accentColor} rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200`}>
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
              {config.icon}
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">{title}</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed tracking-wide">{message}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-4 rounded-2xl border border-white/5 bg-white/[0.03] text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.06] transition-all"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 px-4 py-4 rounded-2xl ${config.buttonClass} text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
