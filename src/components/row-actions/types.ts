import type { LucideIcon } from 'lucide-react';

export interface RowAction {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  hidden?: boolean;
  disabled?: boolean;
}

export interface RowActionSubmenu {
  key: string;
  label: string;
  icon: LucideIcon;
  items: RowAction[];
  hidden?: boolean;
}

export type RowActionEntry = RowAction | RowActionSubmenu;

export interface EntityRowActionSections {
  view?: RowActionEntry[];
  edit?: RowActionEntry[];
  exportPrint?: RowActionEntry[];
  communication?: RowActionEntry[];
  workflow?: RowActionEntry[];
  utility?: RowActionEntry[];
  danger?: RowActionEntry[];
}

export const ROW_ACTION_SUBMENU_LABELS = {
  exportPrint: 'Export & Print',
  communication: 'Communicate',
  workflow: 'Workflow',
  utility: 'More Actions',
} as const;

export const ROW_ACTION_COLLAPSE_THRESHOLD = 2;

export function isRowActionSubmenu(entry: RowActionEntry): entry is RowActionSubmenu {
  return 'items' in entry;
}

export function isRowAction(entry: RowActionEntry): entry is RowAction {
  return 'onClick' in entry;
}

export function visibleEntries(entries?: RowActionEntry[]): RowActionEntry[] {
  return (entries ?? []).filter((entry) => {
    if (entry.hidden) return false;
    if (isRowActionSubmenu(entry)) {
      return entry.items.some((item) => !item.hidden);
    }
    return true;
  });
}

export function visibleActions(entries?: RowActionEntry[]): RowAction[] {
  return visibleEntries(entries).filter(isRowAction);
}

export function countVisibleEntries(entries: RowActionEntry[]): number {
  return visibleEntries(entries).length;
}
