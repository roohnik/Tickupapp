import React from 'react';
import { CloseIcon } from '../components/Icons';

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const FullScreenModal: React.FC<FullScreenModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-100/50 dark:bg-slate-900/50 backdrop-blur-sm z-50 animate-fade-in" dir="rtl" onClick={onClose}>
        <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-200/70 hover:text-gray-800 dark:hover:bg-slate-700 transition-colors z-10"
            aria-label="بستن"
        >
            <CloseIcon className="w-7 h-7" />
        </button>
      <div className="h-full w-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default FullScreenModal;