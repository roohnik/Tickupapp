import React from 'react';
import { CloseIcon } from '../components/Icons';
import { StyleSettings } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'lg' | 'xl' | '2xl';
  styleSettings?: StyleSettings;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg', styleSettings }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const isModern2Style = styleSettings?.primaryColor === '#F59E0B';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`${styleSettings?.backgroundColor || 'bg-white'} dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200/80 dark:border-slate-700 w-full mx-auto animate-slide-in-up relative ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
        style={styleSettings?.fontFamily ? { fontFamily: styleSettings.fontFamily } : {}}
      >
        {title && (
            <div className={`relative ${isModern2Style ? "text-center p-6" : "flex justify-between items-center p-4"} border-b border-gray-100 dark:border-slate-700`}>
                <h2 className={isModern2Style ? "text-2xl font-bold text-brand-text dark:text-slate-100 mx-auto" : "text-lg font-semibold text-brand-text dark:text-slate-100"}>
                    {title}
                </h2>
                <button
                    onClick={onClose}
                    className={`p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700 dark:hover:text-gray-300 transition-colors ${isModern2Style ? 'absolute top-5 left-5' : ''}`}
                >
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
        )}
        {!title && (
            <button
                onClick={onClose}
                className="absolute top-3 left-3 text-gray-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 transition-colors z-10"
            >
                <CloseIcon className="w-5 h-5" />
            </button>
        )}
        <div className={`${isModern2Style ? 'p-8' : 'p-6'} ${!title ? 'pt-8' : ''} max-h-[80vh] overflow-y-auto`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;