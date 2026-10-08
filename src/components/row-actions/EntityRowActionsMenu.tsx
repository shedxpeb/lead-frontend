'use client';

import { useState, useCallback, memo } from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  EntityRowActionSections,
  RowAction,
  RowActionEntry,
  ROW_ACTION_COLLAPSE_THRESHOLD,
  ROW_ACTION_SUBMENU_LABELS,
  visibleEntries,
  isRowActionSubmenu,
  isRowAction,
  countVisibleEntries,
} from './types';

interface EntityRowActionsMenuProps {
  sections: EntityRowActionSections;
  submenuLabels?: Partial<typeof ROW_ACTION_SUBMENU_LABELS>;
  align?: 'start' | 'center' | 'end';
  contentClassName?: string;
}

type SectionKey = keyof EntityRowActionSections;

const SECTION_ORDER: SectionKey[] = [
  'view',
  'edit',
  'exportPrint',
  'communication',
  'workflow',
  'utility',
  'danger',
];

function RowActionItem({
  action,
  destructive,
  onSelect,
}: {
  action: RowAction;
  destructive?: boolean;
  onSelect: () => void;
}) {
  const Icon = action.icon;
  return (
    <DropdownMenuItem
      disabled={action.disabled}
      onClick={onSelect}
      className={destructive ? 'text-destructive focus:text-destructive' : undefined}
    >
      <Icon className="h-4 w-4 mr-2" />
      {action.label}
    </DropdownMenuItem>
  );
}

function RowActionSubmenuBlock({
  submenu,
  destructive,
  onAction,
}: {
  submenu: Extract<RowActionEntry, { items: RowAction[] }>;
  destructive?: boolean;
  onAction: (action: RowAction) => void;
}) {
  const Icon = submenu.icon;
  const items = submenu.items.filter((item) => !item.hidden);
  if (items.length === 0) return null;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Icon className="h-4 w-4 mr-2" />
        {submenu.label}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-52">
        {items.map((action) => (
          <RowActionItem
            key={action.key}
            action={action}
            destructive={destructive}
            onSelect={() => onAction(action)}
          />
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

function renderEntries(
  entries: RowActionEntry[],
  destructive: boolean | undefined,
  onAction: (action: RowAction) => void
) {
  return visibleEntries(entries).map((entry) => {
    if (isRowActionSubmenu(entry)) {
      return (
        <RowActionSubmenuBlock
          key={entry.key}
          submenu={entry}
          destructive={destructive}
          onAction={onAction}
        />
      );
    }
    if (isRowAction(entry)) {
      if (entry.hidden) return null;
      return (
        <RowActionItem
          key={entry.key}
          action={entry}
          destructive={destructive}
          onSelect={() => onAction(entry)}
        />
      );
    }
    return null;
  });
}

function ActionSection({
  entries,
  submenuLabel,
  flat,
  destructive,
  onAction,
}: {
  entries: RowActionEntry[];
  submenuLabel: string;
  flat?: boolean;
  destructive?: boolean;
  onAction: (action: RowAction) => void;
}) {
  const visible = visibleEntries(entries);
  if (visible.length === 0) return null;

  const useSubmenu = !flat && !destructive && countVisibleEntries(visible) > ROW_ACTION_COLLAPSE_THRESHOLD;

  if (useSubmenu) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>{submenuLabel}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-52">
          {renderEntries(visible, destructive, onAction)}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  return <>{renderEntries(visible, destructive, onAction)}</>;
}

export const EntityRowActionsMenu = memo(function EntityRowActionsMenu({
  sections,
  submenuLabels,
  align = 'end',
  contentClassName,
}: EntityRowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const labels = { ...ROW_ACTION_SUBMENU_LABELS, ...submenuLabels };

  const runAction = useCallback((action: RowAction) => {
    action.onClick();
    setOpen(false);
  }, []);

  const groups = SECTION_ORDER.map((key) => ({
    key,
    entries: visibleEntries(sections[key]),
    flat: key === 'view' || key === 'edit' || key === 'danger',
    submenuLabel:
      key === 'exportPrint'
        ? labels.exportPrint
        : key === 'communication'
          ? labels.communication
          : key === 'workflow'
            ? labels.workflow
            : key === 'utility'
              ? labels.utility
              : 'Actions',
    destructive: key === 'danger',
  })).filter((group) => group.entries.length > 0);

  if (groups.length === 0) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={`w-52 p-1 ${contentClassName ?? ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {groups.map((group, index) => (
          <div key={group.key}>
            {index > 0 && <DropdownMenuSeparator />}
            <ActionSection
              entries={group.entries}
              submenuLabel={group.submenuLabel}
              flat={group.flat}
              destructive={group.destructive}
              onAction={runAction}
            />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
