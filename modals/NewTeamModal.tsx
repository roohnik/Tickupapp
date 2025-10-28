import React, { useState, useEffect } from 'react';
import { Team, User } from '../types';
import Modal from './Modal';
import { ICONS, CheckCircleIcon } from '../components/Icons';

const AVAILABLE_TEAM_ICONS = ['CubeIcon', 'UserGroupIcon', 'RocketIcon', 'MegaphoneIcon', 'BanknotesIcon', 'CheckCircleIcon', 'SparklesIcon', 'ThanksIcon'];
const TEAM_CATEGORIES: Team['category'][] = ['محصول', 'فنی', 'فروش', 'بازاریابی', 'عمومی'];

interface NewTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (teamData: Omit<Team, 'id'> & { id?: string }) => void;
    users: User[];
    teamToEdit?: Team | null;
}

const NewTeamModal: React.FC<NewTeamModalProps> = ({ isOpen, onClose, onSave, users, teamToEdit }) => {
    const [name, setName] = useState('');
    const [leadId, setLeadId] = useState('');
    const [memberIds, setMemberIds] = useState<string[]>([]);
    const [icon, setIcon] = useState(AVAILABLE_TEAM_ICONS[0]);
    const [category, setCategory] = useState<Team['category']>(TEAM_CATEGORIES[0]);
    
    const isEditing = !!teamToEdit;

    useEffect(() => {
        if (isOpen) {
            if (teamToEdit) {
                setName(teamToEdit.name);
                setLeadId(teamToEdit.leadId);
                setMemberIds(teamToEdit.memberIds);
                setIcon(teamToEdit.icon);
                setCategory(teamToEdit.category);
            } else {
                setName('');
                setLeadId(users[0]?.id || '');
                setMemberIds([]);
                setIcon(AVAILABLE_TEAM_ICONS[0]);
                setCategory(TEAM_CATEGORIES[0]);
            }
        }
    }, [isOpen, teamToEdit, users]);
    
    const handleMemberToggle = (userId: string) => {
        setMemberIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !leadId) {
            alert('نام تیم و رهبر تیم الزامی است.');
            return;
        }
        onSave({
            ...(isEditing && { id: teamToEdit.id }),
            name,
            leadId,
            memberIds,
            icon,
            category
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'ویرایش تیم' : 'ایجاد تیم جدید'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-brand-text">نام تیم</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-style" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-text">رهبر تیم</label>
                    <select value={leadId} onChange={e => setLeadId(e.target.value)} required className="input-style">
                        {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-text">دسته بندی</label>
                    <select value={category} onChange={e => setCategory(e.target.value as Team['category'])} required className="input-style">
                        {TEAM_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-brand-text">آیکون</label>
                    <div className="mt-2 grid grid-cols-8 gap-2">
                        {AVAILABLE_TEAM_ICONS.map(iconName => {
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
                    <label className="block text-sm font-medium text-brand-text">اعضای تیم</label>
                    <div className="mt-2 p-2 border rounded-lg max-h-40 overflow-y-auto space-y-1">
                        {users.map(user => (
                            <label key={user.id} className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={memberIds.includes(user.id)} 
                                    onChange={() => handleMemberToggle(user.id)}
                                    className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary ml-3"
                                />
                                <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full ml-2"/>
                                <span>{user.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">لغو</button>
                    <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-blue-700">ذخیره</button>
                </div>
            </form>
        </Modal>
    );
};

export default NewTeamModal;