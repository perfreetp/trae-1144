import { create } from 'zustand'

interface AppState {
  sidebarCollapsed: boolean
  alertCount: number
  toggleSidebar: () => void
  setAlertCount: (count: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  alertCount: 3,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setAlertCount: (count) => set({ alertCount: count }),
}))
