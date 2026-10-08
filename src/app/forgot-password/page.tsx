'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/core/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/features/auth/validations';
import { FormInput } from '@/components/form/FormInput';
import { useOtpRecovery } from '@/features/auth/useOtpRecovery';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { persist } = useOtpRecovery();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setSubmitting(true);
    setApiError('');
    const result = await forgotPassword(data);
    setSubmitting(false);
    if (!result.success) {
      setApiError(result.error || "We couldn't send the verification code. Please try again.");
      return;
    }
    // Simplified - just redirect
    router.push(`${ROUTES.resetPassword}?email=${encodeURIComponent(data.email)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">PEB CRM</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Reset your password</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          <p className="text-sm text-gray-500 text-center">
            Enter your email and we&apos;ll send you an OTP to reset your password.
          </p>

          <FormInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            registration={form.register('email')}
            error={form.formState.errors.email?.message}
            required
            disabled={submitting}
          />

          {apiError && (
            <div className="rounded-md bg-red-50 p-3" role="alert">
              <p className="text-sm text-red-800">{apiError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending OTP...
              </span>
            ) : 'Send OTP'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link href={ROUTES.login} className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
