import { createContext, useContext } from 'react';

export interface MessagesLayoutContextValue {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  refreshConversations: () => Promise<void>;
}

export const MessagesLayoutContext = createContext<MessagesLayoutContextValue | null>(null);

export function useMessagesLayout() {
  return useContext(MessagesLayoutContext);
}
