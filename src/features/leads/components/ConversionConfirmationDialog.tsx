'use client';

import { memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export type ConversionType = 'estimate' | 'proposal' | 'quotation';

interface ConversionConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversionType: ConversionType;
  leadId: string;
  leadName: string;
  onConfirm: () => void;
}

export const ConversionConfirmationDialog = memo(function ConversionConfirmationDialog({
  open,
  onOpenChange,
  conversionType,
  leadId,
  leadName,
  onConfirm,
}: ConversionConfirmationDialogProps) {
  const getTitle = () => {
    switch (conversionType) {
      case 'estimate':
        return 'Convert Lead to Estimate';
      case 'proposal':
        return 'Convert Lead to Proposal';
      case 'quotation':
        return 'Convert Lead to Quotation';
    }
  };

  const getMessage = () => {
    switch (conversionType) {
      case 'estimate':
        return `${leadId} will be marked Converted (still viewable). A new draft Estimate will be created and opened for review. Customer details, contact information, and initial notes will be inherited and can be edited before you send.`;
      case 'proposal':
        return `${leadId} will be marked Converted (still viewable). A draft Proposal will be created and opened for review. Customer details, contact information, and initial notes will be inherited. Deliverables, timeline, and company profile will need to be added.`;
      case 'quotation':
        return `${leadId} will be marked Converted (still viewable). A draft Quotation will be created with default rates from Item and opened for pricing — you can edit rates, discounts, GST and terms before sending.`;
    }
  };

  const getButtonText = () => {
    switch (conversionType) {
      case 'estimate':
        return 'Convert to Estimate';
      case 'proposal':
        return 'Convert to Proposal';
      case 'quotation':
        return 'Convert to Quotation';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {getMessage()}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1 sm:flex-none">
            {getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
