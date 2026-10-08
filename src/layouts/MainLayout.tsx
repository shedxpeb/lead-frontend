'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileHeader } from './MobileHeader';
import { MobileNavigation } from './MobileNavigation';
import { ContentWrapper } from '@/components/layout/ContentWrapper';
import { useSidebarWidth, useSidebarIsOpen, useSidebarStore } from '@/store/useSidebarStore';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  currentPath?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showTopbar?: boolean;
}

type PageChrome = {
  showBackButton?: boolean;
  onBackClick?: () => void;
  showTopbar: boolean;
};

type MainLayoutContextValue = {
  setChrome: (chrome: Partial<PageChrome> | null) => void;
};

const MainLayoutContext = createContext<MainLayoutContextValue | null>(null);

/**
 * Nested MainLayout (page-level) becomes a chrome passthrough so the shell
 * from dashboard/layout stays mounted across navigations and loading branches.
 */
function NestedMainLayout({
  children,
  showBackButton,
  onBackClick,
  showTopbar = true,
}: MainLayoutProps) {
  const ctx = useContext(MainLayoutContext);
  const onBackClickRef = useRef(onBackClick);

  useEffect(() => {
    onBackClickRef.current = onBackClick;
  }, [onBackClick]);

  useEffect(() => {
    if (!ctx) return;
    ctx.setChrome({
      showBackButton,
      // Stable wrapper — avoids effect loops from inline onBackClick props
      onBackClick: onBackClickRef.current ? () => onBackClickRef.current?.() : undefined,
      showTopbar,
    });
    // Do not clear chrome on unmount — next page overwrites; clearing races Strict Mode remounts
  }, [ctx, showBackButton, showTopbar]);

  return <>{children}</>;
}

export const MainLayout = function MainLayout({
  children,
  currentPath,
  showBackButton,
  onBackClick,
  showTopbar = true,
}: MainLayoutProps) {
  const parent = useContext(MainLayoutContext);
  if (parent) {
    return (
      <NestedMainLayout
        currentPath={currentPath}
        showBackButton={showBackButton}
        onBackClick={onBackClick}
        showTopbar={showTopbar}
      >
        {children}
      </NestedMainLayout>
    );
  }

  return (
    <ShellMainLayout
      currentPath={currentPath}
      showBackButton={showBackButton}
      onBackClick={onBackClick}
      showTopbar={showTopbar}
    >
      {children}
    </ShellMainLayout>
  );
};

function ShellMainLayout({
  children,
  currentPath,
  showBackButton,
  onBackClick,
  showTopbar = true,
}: MainLayoutProps) {
  const sidebarWidth = useSidebarWidth();
  const isMobileNavOpen = useSidebarIsOpen();
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const [chrome, setChromeState] = useState<PageChrome>({
    showBackButton,
    onBackClick,
    showTopbar,
  });

  const setChrome = useCallback((next: Partial<PageChrome> | null) => {
    if (next === null) return;
    setChromeState((prev) => {
      if (
        prev.showBackButton === (next.showBackButton !== undefined ? next.showBackButton : prev.showBackButton) &&
        prev.showTopbar === (next.showTopbar !== undefined ? next.showTopbar : prev.showTopbar) &&
        next.onBackClick === undefined
      ) {
        return prev;
      }
      return { ...prev, ...next };
    });
  }, []);

  const ctxValue = useMemo(() => ({ setChrome }), [setChrome]);

  const effectiveShowBack = chrome.showBackButton ?? showBackButton;
  const effectiveOnBack = chrome.onBackClick ?? onBackClick;
  const effectiveShowTopbar = chrome.showTopbar ?? showTopbar;

  // On mobile, ensure sidebar is closed initially
  useEffect(() => {
    if (isMobile && isMobileNavOpen) {
      toggleSidebar();
    }
  }, [isMobile, isMobileNavOpen, toggleSidebar]);

  return (
    <MainLayoutContext.Provider value={ctxValue}>
      <div className="min-h-screen bg-background overflow-x-hidden flex">
        {/* Desktop/Tablet Sidebar */}
        <Sidebar currentPath={currentPath} />

        {/* Mobile Navigation Drawer */}
        <MobileNavigation isOpen={isMobileNavOpen} onClose={toggleSidebar} />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Mobile Header */}
          {isMobile && (
            <MobileHeader />
          )}

          {/* Desktop/Tablet Topbar */}
          {effectiveShowTopbar && !isMobile && (
            <Topbar
              showBackButton={effectiveShowBack}
              onBackClick={effectiveOnBack}
            />
          )}

          {/* Page Content */}
          <main className="min-w-0">
            <ContentWrapper>{children}</ContentWrapper>
          </main>
        </div>
      </div>
    </MainLayoutContext.Provider>
  );
};
