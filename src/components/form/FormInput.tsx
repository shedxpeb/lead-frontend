'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/form/FormField';
import { UseFormRegisterReturn } from 'react-hook-form';

export interface FormInputProps {
  label: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  registration: UseFormRegisterReturn;
}

export function FormInput({
  label,
  error,
  required,
  placeholder,
  type = 'text',
  disabled,
  autoComplete,
  inputMode,
  maxLength,
  registration,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <FormField label={label} required={required} error={error}>
      <div className="relative">
        <Input
          type={isPassword && showPassword ? 'text' : type}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          className={isPassword ? 'pr-10' : undefined}
          {...registration}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </FormField>
  );
}
