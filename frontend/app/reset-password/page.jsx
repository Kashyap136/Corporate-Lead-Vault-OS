'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell from '../../components/AuthShell';
import { Alert, PasswordInput, Spinner } from '../../components/ui';
import { apiUrl } from '../../lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [reset, setReset] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: form.password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Password reset failed. Please try again.');
        setLoading(false);
        return;
      }

      setReset(true);
    } catch (err) {
      setError('Connection error. Please check your connection and try again.');
    }
    setLoading(false);
  };

  if (reset) {
    return (
      <AuthShell>
        <div className="card p-6 text-center sm:p-8">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <h1 className="mt-4 text-lg font-semibold text-slate-900">Password reset</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <button onClick={() => router.push('/login')} className="btn btn-primary btn-block mt-6">
            Go to Login
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="card p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-slate-900">Set a new password</h1>
          <p className="mt-1 text-sm text-slate-500">Choose a new password for your account.</p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        {!token && !error && (
          <div className="mb-4">
            <Alert tone="warning">
              This reset link is invalid or expired. Please request a new one.
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <PasswordInput
            id="password"
            label="New password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            hint="Minimum 6 characters."
            required
          />

          <PasswordInput
            id="confirm"
            label="Confirm new password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="Re-enter password"
            autoComplete="new-password"
            required
          />

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading && <Spinner className="h-4 w-4 border-slate-200 border-t-transparent" />}
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
          <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-700">
            Request a new link
          </a>
        </p>
      </div>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-400">Loading…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}