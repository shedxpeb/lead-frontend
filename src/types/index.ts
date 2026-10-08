export type UserRole = 'owner' | 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  permissions: string[];
}

export interface KPICard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color?: string;
  previousValue?: string | number;
  comparisonLabel?: string;
}

export interface KPIDetail {
  title: string;
  data: Record<string, unknown>[];
  columns: {
    key: string;
    label: string;
  }[];
}

export interface Module {
  id: string;
  name: string;
  icon: string;
  path: string;
  permission?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export interface TableConfig {
  columns: {
    key: string;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
  }[];
  data: Record<string, unknown>[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
  loading?: boolean;
}
