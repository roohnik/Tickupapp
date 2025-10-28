import React, { useState, useEffect } from 'react';
import { Workspace } from '../types';
import Modal from './Modal';
import { ICONS, BuildingOfficeIcon, UserIcon } from '../components/Icons';
import { KANBAN_COLOR_OPTIONS, KANBAN_COLOR_MAP } from '../constants';

interface NewWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (workspace: Omit<Workspace, 'id'>) => void;
}

const WORKSPACE_ICONS = ['FolderIcon', 'BuildingOfficeIcon', 'UserGroupIcon', 'SparklesIcon', 'RocketIcon', 'GlobeAltIcon'];

const NewWorkspaceModal: React.FC<NewWorkspaceModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState(WORKSPACE_ICONS[0]);
    const [color, setColor] = useState(KANBAN_COLOR_OPTIONS[0]);
    const [type, setType] = useState<'company' | 'individual'>('company');
    const [companyName, setCompanyName] = useState('');

    useEffect(() => {
        if (!isOpen) {
            // Reset form when modal is closed
            setName('');
            setDescription('');
            setIcon(WORKSPACE_ICONS[0]);
            setColor(KANBAN_COLOR_OPTIONS[0]);
            setType('company');
            setCompanyName('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('نام فضای کاری الزامی است.');
            return;
        }
        onSave({
            name,
            description,
            icon,
            color,
            type,
            companyName: type === 'company' ? companyName : undefined,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ایجاد فضای کاری جدید">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-brand-text">نام فضای کاری</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-style" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-text">توضیحات</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="input-style" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-text">نوع</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setType('company')} className={`p-4 border-2 rounded-lg flex flex-col items-center ${type === 'company' ? 'border-brand-primary' : 'border-gray-300'}`}>
                            <BuildingOfficeIcon className="w-8 h-8 mb-2" />
                            <span className="font-semibold">شرکتی</span>
                        </button>
                        <button type="button" onClick={() => setType('individual')} className={`p-4 border-2 rounded-lg flex flex-col items-center ${type === 'individual' ? 'border-brand-primary' : 'border-gray-300'}`}>
                            <UserIcon className="w-8 h-8 mb-2" />
                            <span className="font-semibold">شخصی</span>
                        </button>
                    </div>
                </div>
                {type === 'company' && (
                    <div>
                        <label className="block text-sm font-medium text-brand-text">نام شرکت</label>
                        <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-style" />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-brand-text">آیکون</label>
                    <div className="mt-2 grid grid-cols-6 gap-2">
                        {WORKSPACE_ICONS.map(iconName => {
                            const IconComponent = ICONS[iconName];
                            return (
                                <button type="button" key={iconName} onClick={() => setIcon(iconName)} className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 ${icon === iconName ? 'border-brand-primary' : 'border-gray-200'}`}>
                                    <IconComponent className="w-6 h-6 text-gray-700" />
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-text">رنگ</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {KANBAN_COLOR_OPTIONS.map(c => (
                            <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full ${KANBAN_COLOR_MAP[c].dot} border-4 ${color === c ? 'ring-2 ring-offset-1 ring-brand-primary border-white' : 'border-transparent'}`} />
                        ))}
                    </div>
                </div>
                <div className="flex justify-end pt-4 border-t">
                    <button type="submit" className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg">ایجاد</button>
                </div>
            </form>
        </Modal>
    );
};

export default NewWorkspaceModal;