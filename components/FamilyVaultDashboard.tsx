

import React, { useState, useRef, useEffect } from 'react';
import { useFamilyVault } from '../hooks/useFamilyVault';
import { USERS } from '../constants';
import { Icon } from './Icon';
import type { User, FamilyBudgetAllocation, ChatMessage } from '../types';

export const FamilyVaultDashboard: React.FC = () => {
    const [currentUserId, setCurrentUserId] = useState(USERS[0].id);
    const { users, onlineUsers, budget, auditLog, vote, chat, notification, currentUser, actions } = useFamilyVault(currentUserId);

    if (!currentUser || !budget) {
        return <div className="text-center p-8">Loading Family Vault...</div>;
    }

    const canEdit = currentUser.role === 'Admin' || currentUser.role === 'Contributor';
    const entertainmentBudget = budget['entertainment'];

    return (
        <div className="space-y-8">
            {notification && (
                <div className="fixed top-20 right-6 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce z-50">
                    {notification}
                </div>
            )}
            <CurrentUserSelector currentUserId={currentUserId} setCurrentUserId={setCurrentUserId} />
            <Header onlineUsers={onlineUsers} users={users} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <ReallocationCard 
                        budget={entertainmentBudget} 
                        users={users} 
                        currentUser={currentUser}
                        canEdit={canEdit}
                        actions={actions} 
                    />
                    <AuditLogCard auditLog={auditLog} />
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <VoteCard 
                        vote={vote} 
                        currentUser={currentUser} 
                        canVote={canEdit}
                        actions={actions}
                    />
                    <ChatCard
                        chat={chat}
                        currentUser={currentUser}
                        canChat={canEdit}
                        actions={actions}
                    />
                </div>
            </div>
        </div>
    );
};

const CurrentUserSelector: React.FC<{currentUserId: string; setCurrentUserId: (id: string) => void}> = ({ currentUserId, setCurrentUserId}) => (
    <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-4">
        <label htmlFor="user-select" className="font-semibold text-gray-700">Viewing as:</label>
        <select 
            id="user-select" 
            value={currentUserId} 
            onChange={e => setCurrentUserId(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg"
        >
            {USERS.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
        </select>
        <p className="text-sm text-gray-500">Change user to see role-based permissions in action.</p>
    </div>
);

const Header: React.FC<{onlineUsers: Set<string>; users: User[]}> = ({ onlineUsers, users }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Family Budget Vault</h2>
                <p className="text-gray-500">A shared space for collaborative budgeting.</p>
            </div>
            <div className="flex items-center">
                <p className="mr-3 text-sm font-medium text-gray-600">Online:</p>
                <div className="flex -space-x-2">
                    {users.filter(u => onlineUsers.has(u.id)).map(u => (
                        <div key={u.id} title={u.name} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xl shadow-sm">
                            {u.avatar}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const ReallocationCard: React.FC<{budget: FamilyBudgetAllocation, users: User[], currentUser: User, canEdit: boolean, actions: any}> = ({ budget, users, currentUser, canEdit, actions }) => {
    const relevantUsers = users.filter(u => u.role !== 'Viewer');
    // Fix for line 100: The value from proposals can be inferred as `unknown` or `any`, causing a type error with the `+` operator.
    // Explicitly convert `val` to a number to ensure the summation is performed correctly. This also fixes the subsequent `toFixed` error.
    const totalProposed = Object.values(budget.proposals).reduce((sum, val) => sum + Number(val), 0);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${budget.color}`}>
                    <Icon name={budget.icon} className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Entertainment Fund Challenge</h3>
                    <p className="text-gray-500">Collaboratively split the <span className="font-bold text-gray-700">${budget.allocated}</span> budget.</p>
                </div>
            </div>
            
            <div className="space-y-4 my-6">
                {relevantUsers.map(user => {
                    const userProposal = budget.proposals[user.id] ?? 0;
                    return (
                        <div key={user.id} className="flex items-center gap-4">
                            <div className="w-8 h-8 text-lg rounded-full bg-gray-100 flex items-center justify-center">{user.avatar}</div>
                            <span className="w-16 font-medium">{user.name}</span>
                            <input 
                                type="range"
                                min="0"
                                max={budget.allocated}
                                value={userProposal}
                                disabled={!canEdit || currentUser.id !== user.id}
                                onChange={e => actions.updateProposal(budget.categoryId, parseInt(e.target.value, 10))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
                            />
                            <span className="w-20 text-right font-semibold text-indigo-600">${userProposal.toFixed(2)}</span>
                        </div>
                    );
                })}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-500">Total Proposed:</p>
                    <p className={`text-2xl font-bold ${totalProposed !== budget.allocated ? 'text-red-500' : 'text-green-600'}`}>
                        {/* Fix for line 141: `totalProposed` is now correctly inferred as a number, so `toFixed` can be safely called. */}
                        ${totalProposed.toFixed(2)}
                    </p>
                </div>
                <button 
                    onClick={() => actions.resolveWithAI(budget.categoryId)}
                    disabled={!canEdit}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
                >
                    Resolve with AI ✨
                </button>
            </div>
        </div>
    );
};

const VoteCard: React.FC<{ vote: any, currentUser: User, canVote: boolean, actions: any }> = ({ vote, currentUser, canVote, actions }) => {
    if (!vote) return null;
    const userVote = vote.votes[currentUser.id];
    
    const yesVotes = Object.values(vote.votes).filter(v => v === 'yes').length;
    const noVotes = Object.values(vote.votes).filter(v => v === 'no').length;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-4">
                <Icon name="UserGroup" className="w-6 h-6 text-gray-500" />
                <h3 className="text-lg font-bold text-gray-800">Family Vote</h3>
            </div>
            <p className="text-gray-600 mb-4">{vote.question}</p>
            <div className="flex gap-4 mb-4">
                <button 
                    onClick={() => actions.submitVote('yes')}
                    disabled={!canVote || !!userVote}
                    className={`w-full py-2 font-semibold rounded-lg border-2 transition-colors ${userVote === 'yes' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:bg-gray-100 disabled:bg-gray-50'}`}
                >
                    Yes ({yesVotes})
                </button>
                <button
                    onClick={() => actions.submitVote('no')}
                    disabled={!canVote || !!userVote}
                    className={`w-full py-2 font-semibold rounded-lg border-2 transition-colors ${userVote === 'no' ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 hover:bg-gray-100 disabled:bg-gray-50'}`}
                >
                    No ({noVotes})
                </button>
            </div>
            {userVote && <p className="text-sm text-center text-gray-500">You have voted. Waiting for others.</p>}
        </div>
    );
};


const ChatCard: React.FC<{ chat: ChatMessage[], currentUser: User, canChat: boolean, actions: any }> = ({ chat, currentUser, canChat, actions }) => {
    const [message, setMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            actions.sendMessage(message.trim());
            setMessage('');
        }
    };
    
    return (
        <div className="bg-white rounded-xl shadow-md flex flex-col h-96">
            <div className="p-4 border-b flex items-center gap-3">
                 <Icon name="ChatBubble" className="w-6 h-6 text-gray-500" />
                 <h3 className="text-lg font-bold text-gray-800">Discussion</h3>
            </div>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {chat.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.userId === currentUser.id ? 'justify-end' : ''}`}>
                        {msg.userId !== currentUser.id && <div className="w-8 h-8 text-lg rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">{USERS.find(u => u.id === msg.userId)?.avatar}</div>}
                        <div className={`max-w-xs px-4 py-2 rounded-xl ${msg.userId === currentUser.id ? 'bg-indigo-500 text-white' : 'bg-gray-100'}`}>
                            <p className="text-sm">{msg.message}</p>
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t">
                <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={canChat ? 'Type a message...' : 'View only'}
                    disabled={!canChat}
                    className="w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                />
            </form>
        </div>
    );
};


const AuditLogCard: React.FC<{ auditLog: any[] }> = ({ auditLog }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center gap-3 mb-4">
            <Icon name="ClipboardList" className="w-6 h-6 text-gray-500" />
            <h3 className="text-lg font-bold text-gray-800">Audit Log</h3>
        </div>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {auditLog.map(log => (
                <div key={log.id} className="text-sm">
                    <span className="font-semibold text-gray-700">{log.userName}</span>
                    <span className="text-gray-500"> {log.action}</span>
                    <span className="text-gray-400 text-xs ml-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
            ))}
        </div>
    </div>
);
