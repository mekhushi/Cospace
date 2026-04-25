import { create } from 'zustand';

export interface User {
  id: number;
  username: string;
  avatar: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null, token: string | null) => void;
  
  // Online users count
  onlineCount: number;
  setOnlineCount: (count: number) => void;
  
  // Proximity Chat State
  activeRoomId: string | null;
  currentZoneName: string | null;
  interactionPrompt: string | null;
  interactionMessage: string | null;
  peersInRoom: any[];
  chatMessages: ChatMessage[];
  setActiveRoom: (roomId: string | null) => void;
  setCurrentZoneName: (name: string | null) => void;
  setInteractionPrompt: (prompt: string | null) => void;
  setInteractionMessage: (msg: string | null) => void;
  addPeerToRoom: (peer: any) => void;
  setPeersInRoom: (peers: any[]) => void;
  removePeerFromRoom: (peerId: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: null,
  setUser: (user, token) => set({ user, token }),
  
  onlineCount: 0,
  setOnlineCount: (count) => set({ onlineCount: count }),
  
  activeRoomId: null,
  currentZoneName: null,
  interactionPrompt: null,
  interactionMessage: null,
  peersInRoom: [],
  chatMessages: [],
  
  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),
  setCurrentZoneName: (name) => set({ currentZoneName: name }),
  setInteractionPrompt: (prompt) => set({ interactionPrompt: prompt }),
  setInteractionMessage: (msg) => set({ interactionMessage: msg }),
  addPeerToRoom: (peer) => set((state) => {
    if (!peer || !peer.id) return state;
    return {
      peersInRoom: state.peersInRoom.find(p => p.id === peer.id) 
        ? state.peersInRoom 
        : [...state.peersInRoom, peer]
    };
  }),
  setPeersInRoom: (peers) => set({ peersInRoom: peers }),
  removePeerFromRoom: (peerId) => set((state) => ({
    peersInRoom: state.peersInRoom.filter(p => p.id !== peerId)
  })),
  addChatMessage: (msg) => set((state) => ({
    chatMessages: [...state.chatMessages, msg]
  })),
  clearChat: () => set({ chatMessages: [], peersInRoom: [], activeRoomId: null, currentZoneName: null }),
}));
