'use client';

import { useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

/**
 * Simplified permission hook for Lead CRM.
 * Since we removed multi-tenancy and complex permissions,
 * all operations are allowed for authenticated users.
 */
export function usePermission() {
  const { user } = useAuth();
  const permissions = useMemo(() => [], [user]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      // Simplified - always return true for authenticated users
      return !!user;
    },
    [user],
  );

  const hasAnyPermission = useCallback(
    (required: string[]): boolean => {
      // Simplified - always return true for authenticated users
      return !!user;
    },
    [user],
  );

  const hasAllPermissions = useCallback(
    (required: string[]): boolean => {
      // Simplified - always return true for authenticated users
      return !!user;
    },
    [user],
  );

  return { permissions, hasPermission, hasAnyPermission, hasAllPermissions };
}
