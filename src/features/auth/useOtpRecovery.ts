'use client';

import { useCallback, useEffect, useState } from 'react';

export type OtpRecoveryPurpose = 'REGISTRATION' | 'FORGOT_PASSWORD';

interface OtpRecoveryState {
  email: string;
  purpose: OtpRecoveryPurpose;
  expiresAt: string;
  resendAvailableAt: number;
}

const STORAGE_KEY = 'peb-crm:otp-recovery';

function readState(): OtpRecoveryState | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || 'null');
    return value?.email && value?.purpose && value?.expiresAt ? value : null;
  } catch {
    return null;
  }
}

export function useOtpRecovery(expectedEmail?: string, expectedPurpose?: OtpRecoveryPurpose) {
  const [state, setState] = useState<OtpRecoveryState | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const saved = readState();
    if (
      saved &&
      (!expectedEmail ||
        (saved.email === expectedEmail.toLowerCase() && saved.purpose === expectedPurpose))
    ) {
      setState(saved);
    }
  }, [expectedEmail, expectedPurpose]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const persist = useCallback((delivery: any, purpose: OtpRecoveryPurpose) => {
    if (!delivery?.email || !delivery?.expiresAt) return;
    const cooldownSeconds =
      typeof delivery.resendAvailableInSeconds === 'number' && delivery.resendAvailableInSeconds >= 0
        ? delivery.resendAvailableInSeconds
        : 60;
    const next: OtpRecoveryState = {
      email: delivery.email.toLowerCase(),
      purpose,
      expiresAt: delivery.expiresAt,
      resendAvailableAt: Date.now() + cooldownSeconds * 1000,
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState(next);
  }, []);

  const clear = useCallback(() => {
    window.sessionStorage.removeItem(STORAGE_KEY);
    setState(null);
  }, []);

  const resendSeconds = Math.max(0, Math.ceil(((state?.resendAvailableAt || 0) - now) / 1000));
  const isExpired = !!state && new Date(state.expiresAt).getTime() <= now;
  const canResend = !!state && resendSeconds <= 0;

  return { state, persist, clear, resendSeconds, isExpired, canResend };
}
