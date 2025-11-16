import { useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socketService';
import type { User, FamilyBudget, AuditLog, ChatMessage, Vote } from '../types';

interface VaultState {
    users: User[];
    onlineUsers: Set<string>;
    budget: FamilyBudget | null;
    auditLog: AuditLog[];
    vote: Vote | null;
    chat: ChatMessage[];
}

export const useFamilyVault = (currentUserId: string) => {
    const [state, setState] = useState<VaultState>({
        users: [],
        onlineUsers: new Set(),
        budget: null,
        auditLog: [],
        vote: null,
        chat: [],
    });
    const [notification, setNotification] = useState<string | null>(null);

    const handleStateUpdate = useCallback((newState: any) => {
        setState(newState);
    }, []);

    const handleNotification = useCallback((data: { message: string }) => {
        setNotification(data.message);
        setTimeout(() => setNotification(null), 3000); // Clear after 3 seconds
    }, []);

    useEffect(() => {
        socketService.connect(currentUserId);
        socketService.on('update', handleStateUpdate);
        socketService.on('notification', handleNotification);

        return () => {
            socketService.disconnect(currentUserId);
            socketService.off('update', handleStateUpdate);
            socketService.off('notification', handleNotification);
        };
    }, [currentUserId, handleStateUpdate, handleNotification]);
    
    const updateProposal = (categoryId: string, amount: number) => {
        socketService.emit('budget:update-proposal', { userId: currentUserId, categoryId, amount });
    };

    const resolveWithAI = (categoryId: string) => {
        socketService.emit('budget:resolve-conflict', { userId: currentUserId, categoryId });
    };
    
    const submitVote = (vote: 'yes' | 'no') => {
        socketService.emit('vote:submit', { userId: currentUserId, vote });
    };

    const sendMessage = (message: string) => {
        socketService.emit('chat:send-message', { userId: currentUserId, message });
    };

    return {
        ...state,
        notification,
        currentUser: state.users.find(u => u.id === currentUserId),
        actions: {
            updateProposal,
            resolveWithAI,
            submitVote,
            sendMessage,
        }
    };
};
