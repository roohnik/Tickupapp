import React, { useState } from 'react';
import { Comment, User } from '../types';

interface CommentsProps {
    comments: Comment[];
    users: User[];
    currentUser: User;
    onAdd: (text: string) => void;
}

const Comments: React.FC<CommentsProps> = ({ comments, users, currentUser, onAdd }) => {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAdd(newComment.trim());
            setNewComment('');
        }
    };

    return (
        <div className="space-y-4">
            {comments.map(comment => {
                const author = users.find(u => u.id === comment.authorId);
                return (
                    <div key={comment.id} className="flex items-start space-x-3 space-x-reverse">
                        <img src={author?.avatarUrl} alt={author?.name} className="w-8 h-8 rounded-full" />
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <span className="font-semibold text-sm">{author?.name}</span>
                                <span className="text-xs text-gray-400">
                                    {new Date(comment.createdAt).toLocaleDateString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-sm text-brand-text mt-1 bg-gray-100 p-2 rounded-md">{comment.text}</p>
                        </div>
                    </div>
                );
            })}

            <div className="flex items-start space-x-3 space-x-reverse pt-4 border-t">
                 <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full" />
                 <form onSubmit={handleSubmit} className="flex-1">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="نظر خود را بنویسید..."
                        rows={2}
                        className="w-full text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button type="submit" className="mt-2 px-3 py-1 bg-brand-primary text-white text-sm font-semibold rounded-md hover:bg-blue-600 disabled:bg-gray-300" disabled={!newComment.trim()}>
                        ارسال
                    </button>
                 </form>
            </div>
        </div>
    );
};

export default Comments;