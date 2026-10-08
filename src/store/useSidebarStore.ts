import { create } from 'zustand';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

export const SIDEBAR_EXPANDED = 250;
export const SIDEBAR_COLLAPSED = 72;

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  expandSidebar: () => void;
  toggleCollapse: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  isCollapsed: false,
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  collapseSidebar: () => set({ isCollapsed: true }),
  expandSidebar: () => set({ isCollapsed: false }),
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setSidebarOpen: (open) => set({ isOpen: open }),
}));

// Hook to compute reactive sidebar width in pixels
export const useSidebarWidth = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isOpen = useSidebarIsOpen();
  const isCollapsed = useSidebarIsCollapsed();

  if (!isDesktop) return 0;
  if (!isOpen) return 0;
  return isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;
};

// Selectors to prevent unnecessary re-renders
export const useSidebarIsOpen = () => useSidebarStore((state) => state.isOpen);
export const useSidebarIsCollapsed = () => useSidebarStore((state) => state.isCollapsed);
export const useSidebarToggle = () => useSidebarStore((state) => state.toggleSidebar);
export const useSidebarToggleCollapse = () => useSidebarStore((state) => state.toggleCollapse);
