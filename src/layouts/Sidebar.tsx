'use client';

import React, { memo, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useSidebarIsOpen,
  useSidebarIsCollapsed,
  useSidebarStore,
} from '@/store/useSidebarStore';
import { useNavigationItems, type NavigationItem } from '@/core/hooks/useNavigationItems';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

interface SidebarProps {
  currentPath?: string;
}

/** Prefetch only Lead CRM routes */
const PREFETCH_HREFS = new Set([
  '/dashboard',
  '/dashboard/leads',
]);

function shouldPrefetch(href?: string): boolean {
  if (!href) return false;
  return PREFETCH_HREFS.has(href);
}

const ACTIVE_STYLE: React.CSSProperties = {
  background: 'linear-gradient(90deg, rgba(58,190,255,0.18), rgba(58,190,255,0.10))',
  borderColor: 'rgba(58,190,255,0.25)',
};

const isLeafActive = (pathname: string, href?: string) => !!href && pathname === href;

const isSectionActive = (pathname: string, item: NavigationItem): boolean => {
  return !!item.href && pathname === item.href;
};

const hasActiveDescendant = (pathname: string, item: NavigationItem): boolean => {
  if (!item.children) return false;
  return item.children.some(
    (child) => !!child.href && (pathname === child.href || pathname.startsWith(`${child.href}/`))
  );
};

const flattenForRail = (items: NavigationItem[]): NavigationItem[] => {
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

export const Sidebar = memo(function Sidebar({ currentPath }: SidebarProps) {
  const nextPathname = usePathname();
  const pathname = currentPath || nextPathname;
  const isOpen = useSidebarIsOpen();
  const isCollapsed = useSidebarIsCollapsed();
  const collapseSidebar = useSidebarStore((state) => state.collapseSidebar);
  const expandSidebar = useSidebarStore((state) => state.expandSidebar);
  const setSidebarOpen = useSidebarStore((state) => state.setSidebarOpen);
  const { items: navigationItems } = useNavigationItems();

  // Responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Auto-collapse on tablet, hide on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else if (isTablet && !isCollapsed) {
      collapseSidebar();
    } else if (isDesktop && !isOpen) {
      setSidebarOpen(true);
      if (isCollapsed) {
        expandSidebar();
      }
    }
  }, [isMobile, isTablet, isDesktop, isOpen, isCollapsed, setSidebarOpen, collapseSidebar, expandSidebar]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      navigationItems.forEach((item) => {
        if (item.children && item.children.length > 0 && hasActiveDescendant(pathname, item)) {
          next[item.title] = true;
        }
      });
      return next;
    });
  }, [pathname, navigationItems]);

  const railItems = useMemo(() => flattenForRail(navigationItems), [navigationItems]);

  const toggleSection = (title: string) =>
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));

  // Don't render sidebar on mobile - use MobileNavigation instead
  if (isMobile) {
    return null;
  }

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar border-r border-border transition-all duration-300 flex flex-col overflow-hidden flex-shrink-0',
        // Desktop: full width
        'lg:w-[250px]',
        // Tablet: compact width
        'md:w-[72px]',
        // Hidden on mobile
        'hidden md:flex',
        isCollapsed && 'lg:w-[72px]'
      )}
    >
      {/* Logo + toggle */}
      <div className={cn(
        'flex items-center justify-between border-b border-border flex-shrink-0',
        isCollapsed ? 'justify-center h-16 px-0' : 'h-16 px-5'
      )}>
        {!isCollapsed && <h1 className="text-xl font-bold text-foreground truncate tracking-tight">Lead CRM</h1>}
        <button
          type="button"
          onClick={() => (isCollapsed ? expandSidebar() : collapseSidebar())}
          className="p-2 rounded-lg hover:bg-card-hover transition-colors text-foreground flex items-center justify-center"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3" aria-label="Primary">
        {isCollapsed ? (
          <ul className="space-y-[2px] px-1">
            {railItems.map((item, index) => {
              const Icon = item.icon;
              const active = isLeafActive(pathname, item.href);
              return (
                <li key={`${item.href}-${index}`}>
                  <Link
                    href={item.href ?? '#'}
                    title={item.title}
                    aria-label={item.title}
                    prefetch={shouldPrefetch(item.href)}
                    className={cn(
                      'flex items-center justify-center w-full h-10 rounded-lg transition-all duration-220 glass-sidebar-hover',
                      active ? 'text-primary' : 'text-foreground'
                    )}
                    style={active ? ACTIVE_STYLE : undefined}
                  >
                    <Icon size={20} />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="space-y-0.5 px-2">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const hasChildren = !!item.children && item.children.length > 0;
              const sectionActive = isSectionActive(pathname, item);
              const isExpanded = expanded[item.title] ?? false;

              if (!hasChildren) {
                const active = isLeafActive(pathname, item.href);
                return (
                  <li key={`${item.href}-${index}`}>
                    <Link
                      href={item.href ?? '#'}
                      prefetch={shouldPrefetch(item.href)}
                      className={cn(
                        'flex items-center gap-3 pl-4 pr-3 h-12 rounded-xl transition-all duration-220 glass-sidebar-hover',
                        active ? 'text-primary' : 'text-foreground'
                      )}
                      style={active ? ACTIVE_STYLE : undefined}
                    >
                      <Icon size={20} />
                      <span className="flex-1 font-medium text-sm truncate">{item.title}</span>
                    </Link>
                  </li>
                );
              }

              return (
                <li key={`${item.title}-${index}`}>
                  <div
                    className={cn(
                      'flex items-center rounded-xl transition-all duration-220 glass-sidebar-hover',
                      sectionActive ? 'text-primary' : 'text-foreground'
                    )}
                    style={sectionActive ? ACTIVE_STYLE : undefined}
                  >
                    {item.href ? (
                        <Link
                          href={item.href}
                          prefetch={shouldPrefetch(item.href)}
                          className="flex flex-1 items-center gap-3 pl-4 pr-3 h-12 min-w-0"
                        >
                          <Icon size={20} />
                          <span className="flex-1 font-medium text-sm truncate">{item.title}</span>
                        </Link>
                    ) : (
                        <button
                          type="button"
                          onClick={() => toggleSection(item.title)}
                          className="flex flex-1 items-center gap-3 pl-4 pr-3 h-12 min-w-0 text-left"
                          aria-expanded={isExpanded}
                          >
                          <Icon size={20} />
                          <span className="flex-1 font-medium text-sm truncate">{item.title}</span>
                        </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleSection(item.title)}
                      className="px-2 h-12 flex items-center text-current/80 hover:text-current flex-shrink-0"
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${item.title}`}
                      aria-expanded={isExpanded}
                    >
                      <ChevronDown
                        size={16}
                        className={cn('transition-transform duration-200', isExpanded ? 'rotate-180' : '')}
                      />
                    </button>
                  </div>

                    {isExpanded && (
                      <ul className="ml-6 space-y-0.5 border-l border-border pl-3">
                      {item.children!.map((child, childIndex) => {
                        const ChildIcon = child.icon;
                        const childActive = isLeafActive(pathname, child.href);
                        return (
                          <li key={`${child.href}-${childIndex}`}>
                            <Link
                              href={child.href ?? '#'}
                              prefetch={shouldPrefetch(child.href)}
                              className={cn(
                                'flex items-center gap-2 px-3 h-10 rounded-lg transition-all duration-220 glass-sidebar-hover text-sm',
                                childActive ? 'text-primary' : 'text-foreground'
                              )}
                              style={childActive ? ACTIVE_STYLE : undefined}
                            >
                              <ChildIcon size={16} />
                              <span className="flex-1 font-medium text-sm truncate">{child.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* Footer */}
      <div className={cn('border-t border-border flex-shrink-0', isCollapsed ? 'p-4' : 'px-4 py-3')}>
        {!isCollapsed && (
          <p className="text-xs text-muted-foreground text-center">© 2026 Lead CRM</p>
        )}
      </div>
    </aside>
  );
});
