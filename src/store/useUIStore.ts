import { create } from "zustand";

interface DashboardFilter {
  wilayah: string; // "semua" | id
  komoditas: string; // "semua" | id
  periodeHari: number;
}

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  dashboardFilter: DashboardFilter;
  setDashboardFilter: (patch: Partial<DashboardFilter>) => void;

  toastMessage: string | null;
  showToast: (message: string) => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  dashboardFilter: { wilayah: "semua", komoditas: "semua", periodeHari: 14 },
  setDashboardFilter: (patch) => set((s) => ({ dashboardFilter: { ...s.dashboardFilter, ...patch } })),

  toastMessage: null,
  showToast: (message) => set({ toastMessage: message }),
  clearToast: () => set({ toastMessage: null }),
}));
