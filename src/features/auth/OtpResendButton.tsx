'use client';

interface OtpResendButtonProps {
  resendSeconds: number;
  disabled?: boolean;
  onResend: () => void;
}

/**
 * Enterprise OTP resend control:
 * - Shows countdown: Resend OTP (60) … Resend OTP (1)
 * - Disabled during cooldown with not-allowed cursor + reduced opacity
 * - Enabled label after cooldown: Resend OTP
 */
export function OtpResendButton({ resendSeconds, disabled, onResend }: OtpResendButtonProps) {
  const coolingDown = resendSeconds > 0;
  const isDisabled = !!disabled || coolingDown;

  return (
    <button
      type="button"
      onClick={onResend}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className="font-medium text-blue-600 hover:text-blue-500 bg-transparent border-none p-0 disabled:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400 cursor-pointer"
    >
      {coolingDown ? `Resend OTP (${resendSeconds})` : 'Resend OTP'}
    </button>
  );
}
