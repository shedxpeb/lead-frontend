'use client';

import { useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { usePermission } from '@/features/auth/usePermission';

export type NavigationRole = 'owner' | 'admin' | 'employee';

export interface NavigationItem {
  title: string;
  /** Optional: group/parent headers (e.g. Inventory, Finance) have no own page. */
  href?: string;
  icon: LucideIcon;
  /** Kept for type-compatibility; sidebar visibility is module+permission driven, not role-driven. */
  roles: NavigationRole[];
  moduleId?: string;
  /** Permission required for this item to be visible (checked alongside module enablement). */
  permission?: string;
  /** Nested navigation children. Presence makes this an expandable parent. */
  children?: NavigationItem[];
}

/**
 * Final navigation for Lead CRM - ONLY Dashboard and Leads
 */
const LEAD_MODULE_NAV: NavigationItem = {
  title: 'Leads',
  href: '/dashboard/leads',
  icon: Users,
  roles: ['owner', 'admin', 'employee'],
  permission: 'lead:list',
};

const DASHBOARD_ITEM: NavigationItem = {
  title: 'Dashboard',
  href: '/dashboard',
  icon: LayoutDashboard,
  roles: ['owner', 'admin', 'employee'],
  permission: 'dashboard:view',
};

export function useNavigationItems() {
  const { hasPermission } = usePermission();

  return useMemo(() => {
    const items: NavigationItem[] = [];

    // Always show Dashboard
    if (hasPermission('dashboard:view')) {
      items.push(DASHBOARD_ITEM);
    }

    // Show Leads (this is the main module)
    if (hasPermission('lead:list')) {
      items.push(LEAD_MODULE_NAV);
    }

    return { items, isLoading: false };
  }, [hasPermission]);
}
