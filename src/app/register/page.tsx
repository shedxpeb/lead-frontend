'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/core/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { registerSchema, RegisterInput } from '@/features/auth/validations';
import { FormInput } from '@/components/form/FormInput';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', name: '', password: '', confirmPassword: '', mobile: '' },
  });

  const onSubmit = async (formData: RegisterInput) => {
    setSubmitting(true);
    setApiError('');
    // Only send fields that the backend accepts
    const { confirmPassword, ...registerData } = formData;
    const result = await registerUser(registerData);
    setSubmitting(false);
    if (result.success) {
      router.push('/dashboard/leads');
    } else {
      setApiError(result.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Lead CRM</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Create your account</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          <FormInput
            label="Full Name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            registration={form.register('name')}
            error={form.formState.errors.name?.message as string}
            required
            disabled={submitting}
          />

          <FormInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            registration={form.register('email')}
            error={form.formState.errors.email?.message as string}
            required
            disabled={submitting}
          />

          <FormInput
            label="Mobile (optional)"
            type="tel"
            placeholder="+1234567890"
            autoComplete="tel"
            registration={form.register('mobile')}
            error={form.formState.errors.mobile?.message as string}
            disabled={submitting}
          />

          <FormInput
            label="Password"
            type="password"
            placeholder="Min 6 characters"
            autoComplete="new-password"
            registration={form.register('password')}
            error={form.formState.errors.password?.message as string}
            required
            disabled={submitting}
          />

          <FormInput
            label="Confirm Password"
            type="password"
            placeholder="•••••••••"
            autoComplete="new-password"
            registration={form.register('confirmPassword')}
            error={form.formState.errors.confirmPassword?.message as string}
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
                Creating account...
              </span>
            ) : 'Create account'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href={ROUTES.login} className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
