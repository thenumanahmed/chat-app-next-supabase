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
  prependMessages: (messages: Imessage[]) => void;
  setMessages: (messages: Imessage[]) => void;
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
        msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
      ),
    })),

  optimisticDeleteMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
    })),

  addMessage: (message) =>
    set((state) => {
      if (state.messages.some((msg) => msg.id === message.id)) {
        return state;
      }
      return {
        messages: [...state.messages, message],
      };
    }),

  prependMessages: (messages) =>
    set((state) => {
      const existingIds = new Set(state.messages.map((m) => m.id));
      const newMessages = messages.filter((m) => !existingIds.has(m.id));
      return {
        messages: [...newMessages, ...state.messages],
      };
    }),

  setMessages: (messages) =>
    set(() => {
      const uniqueMessages = Array.from(new Map(messages.map((m) => [m.id, m])).values());
      // sort by created_at
      const sortedMessages = uniqueMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      return {
        messages: sortedMessages,
      };
    }),
}));