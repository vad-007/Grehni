import { USERS, INITIAL_FAMILY_BUDGET } from '../constants';
import { getAIConflictResolution } from './geminiService';
import type { User, FamilyBudget, AuditLog, ChatMessage, Vote } from '../types';

type Event = 'update' | 'notification' | 'error';
type Listener = (data: any) => void;

interface AppState {
    users: User[];
    onlineUsers: Set<string>;
    budget: FamilyBudget;
    auditLog: AuditLog[];
    vote: Vote;
    chat: ChatMessage[];
}

// Singleton mock socket service
class SocketService {
    private static instance: SocketService;
    private listeners: Map<Event, Listener[]> = new Map();
    private state: AppState;

    private constructor() {
        this.state = {
            users: USERS,
            onlineUsers: new Set(),
            budget: JSON.parse(JSON.stringify(INITIAL_FAMILY_BUDGET)),
            auditLog: [{ id: 'log-0', timestamp: new Date(), userName: 'System', action: 'Family Vault created.' }],
            vote: {
                id: 'v1',
                question: 'Increase monthly Dining Out budget to $350?',
                status: 'open',
                votes: USERS.reduce((acc, user) => ({ ...acc, [user.id]: null }), {}),
            },
            chat: [],
        };
    }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    // --- Public API ---

    connect(userId: string) {
        this.state.onlineUsers.add(userId);
        this.addLog(userId, 'connected.');
        this._broadcastState();
    }
    
    disconnect(userId: string) {
        this.state.onlineUsers.delete(userId);
        this.addLog(userId, 'disconnected.');
        this._broadcastState();
    }
    
    on(event: Event, listener: Listener) {
        const eventListeners = this.listeners.get(event) || [];
        this.listeners.set(event, [...eventListeners, listener]);
    }

    off(event: Event, listener: Listener) {
        const eventListeners = this.listeners.get(event) || [];
        this.listeners.set(event, eventListeners.filter(l => l !== listener));
    }

    emit(eventName: string, payload: any) {
        // Simulate receiving an event from a client
        setTimeout(() => {
            switch (eventName) {
                case 'budget:update-proposal':
                    this.handleUpdateProposal(payload.userId, payload.categoryId, payload.amount);
                    break;
                case 'budget:resolve-conflict':
                    this.handleResolveConflict(payload.userId, payload.categoryId);
                    break;
                case 'vote:submit':
                    this.handleVote(payload.userId, payload.vote);
                    break;
                case 'chat:send-message':
                    this.handleChatMessage(payload.userId, payload.message);
                    break;
                default:
                    console.warn(`Unknown event: ${eventName}`);
            }
        }, 500); // Simulate network latency
    }
    
    // --- Event Handlers (Simulated Server-Side Logic) ---

    private handleUpdateProposal(userId: string, categoryId: string, amount: number) {
        if (this.state.budget[categoryId]) {
            this.state.budget[categoryId].proposals[userId] = amount;
            this.addLog(userId, `proposed $${amount} for ${this.state.budget[categoryId].categoryName}.`);
            this._broadcastState();
        }
    }

    private async handleResolveConflict(userId: string, categoryId: string) {
        const category = this.state.budget[categoryId];
        if (!category) return;
        
        const user = this.getUser(userId);
        this._broadcastNotification(`${user?.name || 'Someone'} asked AI to resolve the budget. Thinking...`);

        const proposalsForAI = Object.entries(category.proposals).reduce((acc, [uid, amount]) => {
            const proposer = this.getUser(uid);
            if (proposer) acc[proposer.name] = amount;
            return acc;
        }, {} as {[key: string]: number});
        
        try {
            const resolution = await getAIConflictResolution(category.allocated, proposalsForAI);
            
            // Apply resolution
            Object.entries(resolution).forEach(([name, amount]) => {
                const userToUpdate = this.state.users.find(u => u.name === name);
                if (userToUpdate) {
                    category.proposals[userToUpdate.id] = amount;
                }
            });

            this.addLog(userId, `used AI to resolve ${category.categoryName} budget.`);
            this._broadcastState();
            this._broadcastNotification('AI has suggested a new budget split!');
        } catch (e) {
            console.error(e);
            this._broadcastError('AI resolution failed. Please try again.');
        }
    }
    
    private handleVote(userId: string, vote: 'yes' | 'no') {
        if(this.state.vote.status === 'open') {
            this.state.vote.votes[userId] = vote;
            this.addLog(userId, `voted "${vote}" on: "${this.state.vote.question}"`);
            this._broadcastState();
        }
    }

    private handleChatMessage(userId: string, message: string) {
        const user = this.getUser(userId);
        if (user) {
            const newMessage: ChatMessage = {
                id: `msg-${Date.now()}`,
                timestamp: new Date(),
                userId,
                userName: user.name,
                message,
            };
            this.state.chat.push(newMessage);
            this._broadcastState();
        }
    }


    // --- Helpers ---
    private getUser(userId: string) {
        return this.state.users.find(u => u.id === userId);
    }
    
    private addLog(userId: string, action: string) {
        const user = this.getUser(userId);
        if (user) {
            this.state.auditLog.unshift({
                id: `log-${Date.now()}`,
                timestamp: new Date(),
                userName: user.name,
                action,
            });
        }
    }

    private _broadcast(event: Event, data: any) {
        const eventListeners = this.listeners.get(event) || [];
        eventListeners.forEach(listener => listener(data));
    }
    
    private _broadcastState() {
        this._broadcast('update', this.state);
    }

    private _broadcastNotification(message: string) {
        this._broadcast('notification', { message });
    }
    
    private _broadcastError(message: string) {
        this._broadcast('error', { message });
    }
}

export const socketService = SocketService.getInstance();
