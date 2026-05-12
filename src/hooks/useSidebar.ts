import { create } from "zustand";

interface SidebarState {
  isExpanded: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
}

export const useSidebar = create<SidebarState>((set) => ({
  isExpanded: true,
  toggle: () => set((state) => ({ isExpanded: !state.isExpanded })),
  expand: () => set({ isExpanded: true }),
  collapse: () => set({ isExpanded: false }),
}));
