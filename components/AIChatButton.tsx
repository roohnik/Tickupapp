import React from 'react';
import { SparklesIcon } from './Icons';

interface AIChatButtonProps {
    onClick: () => void;
    isVisible: boolean;
}

const AIChatButton: React.FC<AIChatButtonProps> = ({ onClick, isVisible }) => {
    
    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-6 left-6 z-50">
            <div 
                className="relative group"
                title="دستیار هوشمند شما"
            >
                <button
                    onClick={onClick}
                    className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-sm border border-black/10 shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="دستیار هوشمند"
                >
                    <SparklesIcon className="w-7 h-7 text-gray-700 transition-transform duration-300 group-hover:scale-110" />
                </button>
            </div>
        </div>
    );
};

export default AIChatButton;
