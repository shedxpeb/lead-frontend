'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, DollarSign, CheckCircle2 } from 'lucide-react';

export type ConversionType = 'estimate' | 'quotation';

interface ConversionTypeSelectorProps {
  selectedType: ConversionType | null;
  onSelect: (type: ConversionType) => void;
}

export const ConversionTypeSelector = memo(function ConversionTypeSelector({
  selectedType,
  onSelect,
}: ConversionTypeSelectorProps) {
  const options = [
    {
      type: 'estimate' as ConversionType,
      title: 'Estimate',
      description: 'Material & scope estimates (no pricing)',
      icon: FileText,
    },
    {
      type: 'quotation' as ConversionType,
      title: 'Quotation',
      description: 'Final quotation with pricing and payment terms',
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">What would you like to convert this lead into?</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((option, index) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.type;
          
          return (
            <button
              key={`${option.type}-${index}`}
              type="button"
              onClick={() => onSelect(option.type)}
              className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-2 rounded-md ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{option.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="h-4 w-4 text-primary absolute top-2 right-2" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});
