import React from 'react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  Icon: React.FC<any>;
  children: React.ReactNode;
  actionText?: string;
}

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, title, Icon, children, actionText = 'فهمیدم!' }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto animate-slide-in-up relative p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-6">
            <Icon className="w-12 h-12 text-blue-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-brand-text mb-4">
            {title}
        </h2>
        
        <div className="text-brand-subtext leading-relaxed space-y-4 text-right">
          {children}
        </div>

        <div className="mt-8">
            <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-colors"
            >
                {actionText}
            </button>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;
