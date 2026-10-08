'use client';

import { memo, useState } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebarStore } from '@/store/useSidebarStore';
import { useAuth } from '@/features/auth/AuthContext';
import { useRouter } from 'next/navigation';

interface MobileHeaderProps {
  title?: string;
}

function getInitials(name?: string, email?: string): string {
  const source = (name || email || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export const MobileHeader = memo(function MobileHeader({ title }: MobileHeaderProps) {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const { user, logout } = useAuth();
  const router = useRouter();
  const initials = getInitials(user?.name, user?.email);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    router.push('/login');
  };

  return (
    <header className="lg:hidden sticky top-0 z-20 bg-background border-b border-border h-14 flex items-center justify-between px-4">
      {/* Left side - Menu */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-12 w-12 flex-shrink-0"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Right side - Profile */}
      <DropdownMenu open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 flex-shrink-0 rounded-full bg-primary text-primary-foreground"
            aria-label="Open profile menu"
            aria-expanded={profileMenuOpen}
          >
            <span className="text-xs font-medium">{initials}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.role || 'Admin'}</p>
          </div>
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
});
