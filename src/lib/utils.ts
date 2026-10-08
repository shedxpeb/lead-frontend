import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface LeadLabelInput {
  customerName?: string | null;
  companyName?: string | null;
  city?: string | null;
  leadNumber?: number | null;
}

export function formatLeadLabel(lead: LeadLabelInput): string {
  const nameParts = [lead.customerName, lead.companyName].filter(
    (x): x is string => x != null && x.trim().length > 0,
  );
  const base = nameParts.join(' - ');
  const cityPart = lead.city != null && lead.city.trim().length > 0
    ? ` (${lead.city.trim()})`
    : '';
  const label = `${base}${cityPart}`;
  if (label.length > 0) return label;
  if (lead.leadNumber != null) return `LD-${String(lead.leadNumber).padStart(6, '0')}`;
  return '';
}
