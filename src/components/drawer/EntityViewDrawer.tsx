'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

/** Standard entity view drawer width: ~47.5% viewport on desktop */
export const ENTITY_DRAWER_PANEL_CLASS =
  'w-full sm:w-[47.5vw] sm:max-w-[960px] sm:min-w-[420px]';

interface EntityViewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function EntityViewDrawer({ open, onOpenChange, children }: EntityViewDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} panelClassName={ENTITY_DRAWER_PANEL_CLASS}>
      {children}
    </Drawer>
  );
}

interface EntityViewHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export function EntityViewHeader({ title, subtitle, onClose }: EntityViewHeaderProps) {
  return (
    <DrawerHeader className="px-6 py-5 shrink-0">
      <div className="flex-1 min-w-0 pr-4">
        <DrawerTitle className="text-xl font-semibold leading-tight truncate">{title}</DrawerTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate mt-1">{subtitle}</p>
        )}
      </div>
      <DrawerClose onClick={onClose} />
    </DrawerHeader>
  );
}

export function EntityViewBadges({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 flex-wrap mb-5', className)}>
      {children}
    </div>
  );
}

export interface MiniKpiItem {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  accentClassName?: string;
}

export function EntityViewKpiStrip({ items, className }: { items: MiniKpiItem[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 mb-6',
        items.length >= 3 && 'lg:grid-cols-4',
        className
      )}
    >
      {items.map((item, index) => (
        <Card key={index} className="shadow-none border bg-muted/20">
          <CardContent className="p-3 sm:p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">
                  {item.label}
                </p>
                <p className="text-sm sm:text-base font-bold mt-1 truncate leading-tight">
                  {item.value ?? '-'}
                </p>
              </div>
              {item.icon && (
                <div
                  className={cn(
                    'h-8 w-8 rounded-md flex items-center justify-center shrink-0 bg-background border',
                    item.accentClassName
                  )}
                >
                  {item.icon}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface EntityViewSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EntityViewSection({ title, children, icon, className }: EntityViewSectionProps) {
  return (
    <Card className={cn('shadow-none border', className)}>
      <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5">{children}</CardContent>
    </Card>
  );
}

export function EntityViewFieldGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4', className)}>
      {children}
    </div>
  );
}

export function EntityViewField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1 min-w-0">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <div className="text-sm font-medium break-words leading-snug">{value ?? '-'}</div>
    </div>
  );
}

export function EntityViewBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <DrawerContent className={cn('px-6 py-5 sm:px-7 sm:py-6', className)}>
      {children}
    </DrawerContent>
  );
}

export function EntityViewTabs({
  defaultValue,
  children,
  className,
}: {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Tabs defaultValue={defaultValue} className={cn('w-full', className)}>
      {children}
    </Tabs>
  );
}

export function EntityViewTabsList({ children }: { children: React.ReactNode }) {
  return (
    <TabsList className="w-full flex flex-wrap h-auto gap-1.5 p-1 bg-muted/50">
      {children}
    </TabsList>
  );
}

export function EntityViewTabTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsTrigger value={value} className="text-xs sm:text-sm px-3 py-1.5">
      {children}
    </TabsTrigger>
  );
}

export function EntityViewTabContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsContent value={value} className={cn('space-y-5 mt-5', className)}>
      {children}
    </TabsContent>
  );
}

interface EntityViewFooterProps {
  onClose: () => void;
  children?: React.ReactNode;
}

export function EntityViewFooter({ onClose, children }: EntityViewFooterProps) {
  return (
    <DrawerFooter className="flex flex-row gap-2 justify-end px-6 py-4 shrink-0">
      <Button variant="outline" onClick={onClose}>
        Close
      </Button>
      {children}
    </DrawerFooter>
  );
}

export function formatDrawerDate(value?: Date | string | null) {
  if (!value) return '-';
  return dayjs(value).isValid() ? dayjs(value).format('DD/MM/YYYY') : '-';
}

export function formatDrawerDateTime(value?: Date | string | null) {
  if (!value) return '-';
  return dayjs(value).isValid() ? dayjs(value).format('DD/MM/YYYY HH:mm') : '-';
}

export function formatDrawerBool(value?: boolean) {
  if (value === undefined || value === null) return '-';
  return value ? 'Yes' : 'No';
}

export function getDrawerAgeDays(value?: Date | string | null) {
  if (!value) return '-';
  const created = new Date(value);
  const diff = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
  return `${diff}d`;
}
