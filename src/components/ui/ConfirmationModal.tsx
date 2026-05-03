import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm Delete',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: {
      icon: 'text-red-400 bg-red-500/10 border-red-500/20',
      button: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
      glow: 'bg-red-500/10'
    },
    warning: {
      icon: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
      glow: 'bg-amber-500/10'
    },
    info: {
      icon: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20',
      glow: 'bg-indigo-500/10'
    }
  };

  const activeColor = colors[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-gray-950 border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
         {/* Decorative Glow */}
         <div className={`absolute top-0 right-0 w-64 h-64 ${activeColor.glow} rounded-full blur-[80px] -mr-32 -mt-32`} />
         
         <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border transition-transform duration-500 hover:scale-110 ${activeColor.icon}`}>
               <FiAlertTriangle className="h-8 w-8" />
            </div>

            {/* Content */}
            <div className="space-y-2">
               <h2 className="text-2xl font-black text-white uppercase tracking-tight">{title}</h2>
               <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  {message}
               </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
               <button 
                 onClick={onClose}
                 className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/5"
               >
                 {cancelText}
               </button>
               <button 
                 onClick={onConfirm}
                 disabled={isLoading}
                 className={`flex-1 px-6 py-4 ${activeColor.button} text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2`}
               >
                 {isLoading ? (
                   <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                 ) : (
                   confirmText
                 )}
               </button>
            </div>
         </div>

         {/* Close button */}
         <button 
           onClick={onClose} 
           className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 border border-white/5 text-gray-500 hover:text-white transition-all"
         >
           <FiX className="h-5 w-5" />
         </button>
      </div>
    </div>
  );
};

export default ConfirmationModal;
