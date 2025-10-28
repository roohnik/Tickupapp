import React, { useState } from 'react';
import { User, Team, Role } from '../types';
import Modal from './Modal';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Omit<User, 'id' | 'avatarUrl'>) => void;
  teams: Team[];
}

const ROLES: Role[] = ['admin', 'lead', 'member'];

const NewUserModal: React.FC<NewUserModalProps> = ({ isOpen, onClose, onSave, teams }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('member');
    const [teamId, setTeamId] = useState<string | undefined>(undefined);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !username.trim() || !password.trim()) {
            alert('نام، نام کاربری و رمز عبور الزامی است.');
            return;
        }
        onSave({
            name,
            username,
            password,
            role,
            teamId: teamId || undefined,
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ایجاد کاربر جدید">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-brand-text">نام کامل</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-style" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-text">نام کاربری</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="input-style" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-text">رمز عبور</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-style" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-text">نقش</label>
                    <select value={role} onChange={e => setRole(e.target.value as Role)} required className="input-style">
                        {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-text">تیم (اختیاری)</label>
                    <select value={teamId || ''} onChange={e => setTeamId(e.target.value || undefined)} className="input-style">
                        <option value="">بدون تیم</option>
                        {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                    </select>
                </div>

                <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">لغو</button>
                    <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-blue-700">ایجاد کاربر</button>
                </div>
            </form>
        </Modal>
    );
};

export default NewUserModal;
