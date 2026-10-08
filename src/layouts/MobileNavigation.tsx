'use client';

import { memo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { X, LogOut } from 'lucide-react';
import { useNavigationItems, type NavigationItem } from '@/core/hooks/useNavigationItems';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACTIVE_STYLE: React.CSSProperties = {
  background: 'linear-gradient(90deg, rgba(58,190,255,0.18), rgba(58,190,255,0.10))',
  borderColor: 'rgba(58,190,255,0.25)',
};

const isLeafActive = (pathname: string, href?: string) => !!href && pathname === href;

const flattenForMobile = (items: NavigationItem[]): NavigationItem[] => {
  const out: NavigationItem[] = [];
  for (const item of items) {
    if (item.href) {
      out.push(item);
    } else if (item.children) {
      out.push(...item.children.filter((child) => child.href));
    }
  }
  return out;
};

export const MobileNavigation = memo(function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { items: navigationItems } = useNavigationItems();
  const { logout } = useAuth();
  const mobileItems = flattenForMobile(navigationItems);

  // Only lock body scroll on mobile when drawer is open
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;

    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    logout();
    onClose();
    router.push('/login');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        id="mobile-navigation"
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-border transition-transform duration-300 flex flex-col w-[280px] max-w-[85vw]',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border h-14 px-4 flex-shrink-0">
          <h1 className="text-lg font-bold text-foreground">Lead CRM</h1>
          <button
            type="button"
            onClick={onClose}
            className="p-3 rounded-lg hover:bg-card-hover transition-colors text-foreground h-12 w-12 flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2" aria-label="Mobile navigation">
          <ul className="space-y-1">
            {mobileItems.map((item, index) => {
              const Icon = item.icon;
              const active = isLeafActive(pathname, item.href);
              return (
                <li key={`${item.href}-${index}`}>
                  <Link
                    href={item.href ?? '#'}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-220 min-h-[48px]',
                      active ? 'text-primary' : 'text-foreground'
                    )}
                    style={active ? ACTIVE_STYLE : undefined}
                  >
                    <Icon size={20} />
                    <span className="font-medium text-sm">{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer with Logout */}
        <div className="border-t border-border px-4 py-3 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-220 w-full text-left text-foreground hover:bg-card-hover min-h-[48px]"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
          <p className="text-xs text-muted-foreground text-center mt-3">© 2026 Lead CRM</p>
        </div>
      </aside>
    </>
  );
});
