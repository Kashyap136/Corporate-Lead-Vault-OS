'use client';
import { useState } from 'react';
import Link from 'next/link';
import AuthShell from '../../components/AuthShell';
import { Alert, Spinner } from '../../components/ui';
import { apiUrl } from '../../lib/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const value = email.trim();
    if (!value) {
      setError('Email is required');
      return;
    }
    if (!EMAIL_RE.test(value)) {
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value.toLowerCase() })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError('Connection error. Please check your connection and try again.');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <AuthShell>
        <div className="card p-6 text-center sm:p-8">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </span>
          <h1 className="mt-4 text-lg font-semibold text-slate-900">Check your email</h1>
          <p className="mt-1 text-sm text-slate-500">
            If an account exists for this email, password reset instructions have been sent.
          </p>
          <Link href="/login" className="btn btn-primary btn-block mt-6">
            Back to Login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="card p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-slate-900">Reset your password</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter the email address linked to your account and we&apos;ll send you a reset link.
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="field">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="admin@example.com"
              autoComplete="email"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading && <Spinner className="h-4 w-4 border-slate-200 border-t-transparent" />}
            {loading ? 'Sending…' : 'Send Reset Instructions'}
          </button>
        </form>

        <p className="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Back to Login
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}