import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>
      <p className="text-sm text-slate-600">The page you requested does not exist.</p>
      <Link href="/dashboard" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
        Go to dashboard
      </Link>
    </div>
  );
}
