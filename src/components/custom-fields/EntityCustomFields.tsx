'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type CustomFieldType = 'text' | 'number' | 'boolean' | 'select' | 'textarea';

export interface CustomFieldDefinition {
  key: string;
  label: string;
  type: CustomFieldType;
  options?: string[];
  required?: boolean;
}

type CustomFieldValues = Record<string, string | number | boolean | undefined>;

interface EntityCustomFieldsProps {
  fields: CustomFieldDefinition[];
  values?: CustomFieldValues;
  onChange?: (key: string, value: string | number | boolean) => void;
  mode: 'form' | 'view';
}

function formatDisplayValue(
  value: string | number | boolean | undefined,
  field: CustomFieldDefinition
) {
  if (value === undefined || value === null || value === '') return '-';
  if (field.type === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

export function EntityCustomFields({
  fields,
  values,
  onChange,
  mode,
}: EntityCustomFieldsProps) {
  const safeValues = values ?? {};
  if (fields.length === 0) return null;

  if (mode === 'view') {
    return (
      <div>
        <h4 className="text-sm font-semibold mb-3">Custom Fields</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <p className="text-xs text-muted-foreground">{field.label}</p>
              <p className="text-sm font-medium break-words">
                {formatDisplayValue(safeValues[field.key], field)}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleChange = (key: string, value: string | number | boolean) => {
    onChange?.(key, value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Custom Fields</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => {
            const value = safeValues[field.key];

            if (field.type === 'select' && field.options?.length) {
              return (
                <div key={field.key} className="space-y-2">
                  <label className="text-sm font-medium">
                    {field.label}
                    {field.required && ' *'}
                  </label>
                  <Select
                    value={value !== undefined ? String(value) : ''}
                    onValueChange={(v) => handleChange(field.key, v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }

            if (field.type === 'textarea') {
              return (
                <div key={field.key} className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">
                    {field.label}
                    {field.required && ' *'}
                  </label>
                  <textarea
                    className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={value !== undefined ? String(value) : ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                  />
                </div>
              );
            }

            if (field.type === 'boolean') {
              return (
                <div key={field.key} className="space-y-2">
                  <label className="text-sm font-medium">{field.label}</label>
                  <Select
                    value={value === true ? 'yes' : value === false ? 'no' : ''}
                    onValueChange={(v) => handleChange(field.key, v === 'yes')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              );
            }

            return (
              <div key={field.key} className="space-y-2">
                <label className="text-sm font-medium">
                  {field.label}
                  {field.required && ' *'}
                </label>
                <Input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={value !== undefined ? String(value) : ''}
                  onChange={(e) =>
                    handleChange(
                      field.key,
                      field.type === 'number' ? Number(e.target.value) : e.target.value
                    )
                  }
                  required={field.required}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function getCustomFieldValue(
  entity: { customFields?: CustomFieldValues },
  key: string
) {
  return entity.customFields?.[key];
}
