import { create } from 'zustand'

export type Imessage = {
  id: number;
  created_at: string;
  is_edit: boolean;
  send_by: string;
  text: string;
  users: {
    avatar_url: string;
    created_at: string;
    display_name: string;
    id: string;
  } | null;
};

// Define types for state & actions
interface MessageState {
  messages: Imessage[];
  actionMessage: Imessage | undefined;
  actionType: 'edit' | 'delete' | null;

  setAction: (message: Imessage | undefined, type: 'edit' | 'delete' | null) => void;

  addMessage: (message: Imessage) => void;
  optimisticEditMessage: (message: Imessage) => void;
  optimisticDeleteMessage: (messageId: number) => void;
}

// Create store using the curried form of `create`
export const useMessages = create<MessageState>()((set) => ({
  messages: [],
  actionMessage: undefined,
  actionType: null,

  setAction: (message, type) => set({
    actionMessage: message,
    actionType: type,
  }),

  optimisticEditMessage: (updatedMessage) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === updatedMessage.id ? {...msg, ...updatedMessage} : msg
      ),
    })),

  optimisticDeleteMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
    })),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
}));