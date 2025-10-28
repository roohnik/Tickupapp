import React from 'react';
import { Document, DocumentBlock } from '../types';
import { ArrowUturnLeftIcon, ArrowUturnRightIcon, ChevronDownIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon } from './Icons';

interface DocumentToolbarProps {
    position: { top: number, left: number };
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    fontOptions: { name: string; value: string }[];
    selectedFont: string;
    onFontChange: (font: string) => void;
    fontSizeOptions: { name: string, value: Document['fontSize'] }[];
    selectedFontSize: Document['fontSize'];
    onFontSizeChange: (size: Document['fontSize']) => void;
    activeBlock: DocumentBlock | undefined;
    onAlignmentChange: (align: DocumentBlock['textAlign']) => void;
}

const ToolbarButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode, title: string, isActive?: boolean }> = ({ onClick, disabled, children, title, isActive }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-2 rounded ${isActive ? 'bg-gray-600' : 'hover:bg-gray-700'} disabled:text-gray-500 disabled:hover:bg-transparent`}
    >
        {children}
    </button>
);

const ToolbarDivider: React.FC = () => <div className="w-px h-5 bg-gray-600 mx-1"></div>;

const DocumentToolbar: React.FC<DocumentToolbarProps> = ({
    position,
    onUndo, onRedo, canUndo, canRedo,
    fontOptions, selectedFont, onFontChange,
    fontSizeOptions, selectedFontSize, onFontSizeChange,
    activeBlock, onAlignmentChange
}) => {
    return (
        <div
            style={{ top: position.top, left: position.left }}
            className="fixed z-20 transform -translate-x-1/2 -translate-y-full -mt-2 animate-fade-in"
            onMouseDown={(e) => e.preventDefault()} // Prevents text from deselecting when interacting with toolbar
        >
            <div className="flex items-center space-x-1 space-x-reverse bg-gray-800 text-white p-1 rounded-lg shadow-lg">
                <ToolbarButton onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
                    <ArrowUturnLeftIcon className="w-5 h-5" />
                </ToolbarButton>
                <ToolbarButton onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
                    <ArrowUturnRightIcon className="w-5 h-5" />
                </ToolbarButton>

                <ToolbarDivider />

                <select
                    value={selectedFont}
                    onChange={e => onFontChange(e.target.value)}
                    className="text-sm border-none bg-transparent text-white focus:ring-0 p-1 rounded-md hover:bg-gray-700 font-medium appearance-none pr-6"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'left 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em' }}
                >
                    {fontOptions.map(font => (
                        <option key={font.value} value={font.value} style={{ fontFamily: font.value }} className="bg-gray-800">
                            {font.name}
                        </option>
                    ))}
                </select>

                 <select
                    value={selectedFontSize}
                    onChange={e => onFontSizeChange(e.target.value as Document['fontSize'])}
                    className="text-sm border-none bg-transparent text-white focus:ring-0 p-1 rounded-md hover:bg-gray-700 font-medium w-24 appearance-none pr-6"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'left 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em' }}
                >
                    {fontSizeOptions.map(size => (
                        <option key={size.value} value={size.value} className="bg-gray-800">
                            {size.name}
                        </option>
                    ))}
                </select>

                <ToolbarDivider />
                
                <div className="flex items-center">
                    <ToolbarButton 
                        onClick={() => onAlignmentChange('right')}
                        isActive={!activeBlock?.textAlign || activeBlock?.textAlign === 'right'}
                        disabled={!activeBlock || activeBlock.type === 'table'}
                        title="Right Align"
                    >
                        <AlignRightIcon className="w-5 h-5" />
                    </ToolbarButton>
                     <ToolbarButton 
                        onClick={() => onAlignmentChange('center')}
                        isActive={activeBlock?.textAlign === 'center'}
                        disabled={!activeBlock || activeBlock.type === 'table'}
                        title="Center Align"
                    >
                        <AlignCenterIcon className="w-5 h-5" />
                    </ToolbarButton>
                     <ToolbarButton 
                        onClick={() => onAlignmentChange('left')}
                        isActive={activeBlock?.textAlign === 'left'}
                        disabled={!activeBlock || activeBlock.type === 'table'}
                        title="Left Align"
                    >
                        <AlignLeftIcon className="w-5 h-5" />
                    </ToolbarButton>
                </div>
            </div>
        </div>
    );
};

export default DocumentToolbar;
