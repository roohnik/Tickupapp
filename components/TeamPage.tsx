import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreContext';
import { createTeam, updateTeam, deleteTeam } from '../emitter';
import { User, Team, Objective, Task, FormSubmission, Form, FeedbackTag } from '../types';
import MemberProfileSidePanel from './MemberProfileSidePanel';
import NewTeamModal from '../modals/NewTeamModal';
import { ICONS, PlusIcon, EditIcon, TrashIcon, StarIcon } from './Icons';
import { calculateObjectiveProgress } from '../utils/objectiveUtils';

const CircularProgress: React.FC<{ progress: number }> = ({ progress }) => {
    const radius = 16;
    const stroke = 3;
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            <circle stroke="#e5e7eb" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
            <circle stroke="currentColor" fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset }} strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius} />
        </svg>
    );
};

const MemberCard: React.FC<{ user: User, objectives: Objective[], onClick: () => void }> = ({ user, objectives, onClick }) => {
    const userObjectives = useMemo(() => objectives.filter(o => o.ownerId === user.id && !o.isArchived), [objectives, user.id]);
    const avgProgress = useMemo(() => {
        if (userObjectives.length === 0) return 0;
        const total = userObjectives.reduce((sum, obj) => sum + calculateObjectiveProgress(obj), 0);
        return total / userObjectives.length;
    }, [userObjectives]);
    
    const progressColor = avgProgress < 40 ? 'text-red-500' : avgProgress < 70 ? 'text-yellow-500' : 'text-green-500';

    return (
        <div onClick={onClick} className="bg-white p-4 rounded-xl border shadow-sm cursor-pointer hover:border-brand-primary hover:shadow-lg transition-all flex flex-col items-center text-center">
            <div className="relative">
                <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full" />
                <div className="absolute -bottom-2 -right-2">
                    <div className={`relative w-10 h-10 ${progressColor}`}>
                        <CircularProgress progress={avgProgress} />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                            {Math.round(avgProgress)}%
                        </span>
                    </div>
                </div>
            </div>
            <h3 className="font-semibold mt-4 text-brand-text">{user.name}</h3>
            <p className="text-sm text-brand-subtext capitalize">{user.role}</p>
        </div>
    );
};

const TeamCard: React.FC<{ team: Team, users: User[], onEdit: () => void, onDelete: () => void }> = ({ team, users, onEdit, onDelete }) => {
    const Icon = ICONS[team.icon] || ICONS['UserGroupIcon'];
    const leader = users.find(u => u.id === team.leadId);
    const members = users.filter(u => team.memberIds.includes(u.id));

    return (
        <div className="bg-white p-4 rounded-xl border shadow-sm group relative">
            <div className="absolute top-2 left-2 flex items-center space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="p-2 rounded-full bg-white/50 hover:bg-gray-200 text-gray-600"><EditIcon className="w-4 h-4"/></button>
                <button onClick={onDelete} className="p-2 rounded-full bg-white/50 hover:bg-gray-200 text-gray-600"><TrashIcon className="w-4 h-4"/></button>
            </div>
            <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-gray-600" />
                </div>
                <div className="mr-4">
                    <h3 className="font-semibold text-brand-text">{team.name}</h3>
                    <p className="text-sm text-brand-subtext">{team.category}</p>
                </div>
            </div>
            <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-brand-subtext">اعضا ({members.length})</span>
                    {leader && (
                        <div className="flex items-center" title={`رهبر تیم: ${leader.name}`}>
                            <img src={leader.avatarUrl} alt={leader.name} className="w-6 h-6 rounded-full ring-2 ring-white"/>
                            <StarIcon className="w-4 h-4 text-yellow-400 -mr-2" filled />
                        </div>
                    )}
                </div>
                <div className="flex -space-x-2 space-x-reverse">
                    {members.slice(0, 5).map(member => (
                        <img key={member.id} src={member.avatarUrl} alt={member.name} title={member.name} className="w-8 h-8 rounded-full ring-2 ring-white"/>
                    ))}
                    {members.length > 5 && (
                        <div className="w-8 h-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            +{members.length - 5}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface TeamPageProps {
    users: User[];
    teams: Team[];
    objectives: Objective[];
    tasks: Task[];
    submissions: FormSubmission[];
    forms: Form[];
    feedbackTags: FeedbackTag[];
    onSaveTeam: (teamData: Omit<Team, 'id'> & { id?: string }) => void;
    onDeleteTeam: (teamId: string) => void;
}

const TeamPage: React.FC = observer(() => {
    const { userStore, teamStore, objectiveStore, taskStore, formStore, feedbackStore, uiStore } = useStore();
    const users = userStore.users;
    const teams = teamStore.teams;
    const objectives = objectiveStore.objectives;
    const tasks = taskStore.tasks;
    const submissions = formStore.submissions;
    const forms = formStore.forms;
    const feedbackTags = feedbackStore.feedbackTags;
    
    const [activeTab, setActiveTab] = useState<'members' | 'teams'>('members');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
    
    const handleSaveTeam = async (teamData: Omit<Team, 'id'> & { id?: string }) => {
        if (teamData.id) {
            await updateTeam({ teamId: teamData.id, fields: teamData });
        } else {
            await createTeam(teamData);
        }
        setIsTeamModalOpen(false);
    };
    
    const handleDeleteTeam = async (teamId: string) => {
        await deleteTeam(teamId);
    };
    
    const handleEditTeam = (team: Team) => {
        setTeamToEdit(team);
        setIsTeamModalOpen(true);
    };

    const handleCreateTeam = () => {
        setTeamToEdit(null);
        setIsTeamModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-text">تیم</h1>
            </div>

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6 space-x-reverse">
                    <button onClick={() => setActiveTab('members')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'members' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>اعضا</button>
                    <button onClick={() => setActiveTab('teams')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'teams' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>تیم‌ها</button>
                </nav>
            </div>

            {activeTab === 'members' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {users.map(user => (
                        <MemberCard key={user.id} user={user} objectives={objectives} onClick={() => setSelectedUser(user)} />
                    ))}
                </div>
            )}
            
            {activeTab === 'teams' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button onClick={handleCreateTeam} className="flex items-center px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold shadow-sm hover:bg-blue-600">
                            <PlusIcon className="w-5 h-5 ml-2"/>
                            ایجاد تیم جدید
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.map(team => (
                            <TeamCard key={team.id} team={team} users={users} onEdit={() => handleEditTeam(team)} onDelete={() => handleDeleteTeam(team.id)} />
                        ))}
                    </div>
                </div>
            )}

            {selectedUser && (
                <MemberProfileSidePanel 
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    objectives={objectives}
                    tasks={tasks}
                    submissions={submissions}
                    forms={forms}
                    users={users}
                    feedbackTags={feedbackTags}
                />
            )}
            
            {isTeamModalOpen && (
                <NewTeamModal 
                    isOpen={isTeamModalOpen}
                    onClose={() => setIsTeamModalOpen(false)}
                    onSave={handleSaveTeam}
                    users={users}
                    teamToEdit={teamToEdit}
                />
            )}
        </div>
    );
});

export default TeamPage;