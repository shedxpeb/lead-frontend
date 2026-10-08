'use client';

import { memo } from 'react';
import Link from 'next/link';
import { LogOut, Sun, Moon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useTheme } from '@/theme/ThemeProvider';
import { Breadcrumbs } from './Breadcrumbs';
import { useAuth } from '@/features/auth/AuthContext';
import { useSidebarStore } from '@/store/useSidebarStore';

interface TopbarProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

function getInitials(name?: string, email?: string): string {
  const source = (name || email || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export const Topbar = memo(function Topbar({ title, subtitle, showBackButton, onBackClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme, isMounted } = useTheme();
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const displayName = user?.name || user?.email || 'User';
  const initials = getInitials(user?.name, user?.email);
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
    : '';

  return (
    <header className="h-16 bg-navbar border-b border-border flex items-center justify-between px-4 md:px-5 lg:px-6 2xl:px-8 flex-shrink-0 w-full">
      {/* Left side */}
      <div className="flex items-center gap-2 min-w-0 flex-shrink">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-10 w-10 flex-shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onBackClick} className="h-10 w-10 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Button>
        )}

        <div className="min-w-0" />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        {/* Theme */}
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="h-10 w-10 hidden md:flex flex-shrink-0">
          {isMounted && (theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />)}
        </Button>

        {/* Profile */}
        <div className="flex items-center gap-2 md:gap-3 pl-3 md:pl-4 border-l border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <span className="text-primary-foreground text-xs font-medium">{initials}</span>
            </div>
            <div className="hidden xl:block min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              {roleLabel && <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
});
