import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedRepoId: string | null;
  setSelectedRepoId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  selectedRepoId: null,
  setSelectedRepoId: (id) => set({ selectedRepoId: id }),
}));
