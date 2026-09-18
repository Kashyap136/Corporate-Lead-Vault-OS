'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthShell from '../../components/AuthShell';
import { Alert, PasswordInput, Spinner } from '../../components/ui';
import { apiUrl } from '../../lib/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBDOMAIN_RE = /^[a-z0-9-]+$/;

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    subdomain: '',
    ownerEmail: '',
    password: '',
    websiteUrl: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return 'Company name is required';
    const subdomain = form.subdomain.trim().toLowerCase();
    if (subdomain.length < 3 || subdomain.length > 30) return 'Subdomain must be 3-30 characters';
    if (!SUBDOMAIN_RE.test(subdomain)) return 'Subdomain can only contain lowercase letters, numbers, and hyphens';
    if (subdomain.startsWith('-') || subdomain.endsWith('-')) return 'Subdomain cannot start or end with a hyphen';
    if (!EMAIL_RE.test(form.ownerEmail.trim())) return 'Enter a valid email address';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.websiteUrl.trim()) {
      try {
        const url = new URL(form.websiteUrl.trim());
        if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error();
        if (!url.hostname) throw new Error();
      } catch (e) {
        return 'Enter a valid website URL (e.g. https://example.com)';
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          subdomain: form.subdomain.trim().toLowerCase(),
          ownerEmail: form.ownerEmail.trim().toLowerCase(),
          password: form.password,
          websiteUrl: form.websiteUrl.trim()
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      setRegistered(true);
    } catch (err) {
      setError('Connection error. Please check your connection and try again.');
    }
    setLoading(false);
  };

  if (registered) {
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
          <h1 className="mt-4 text-lg font-semibold text-slate-900">Account created</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your company account is ready. You can now sign in.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="btn btn-primary btn-block mt-6"
          >
            Go to Login
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell wide>
      <div className="card p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-slate-900">Create your company account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Set up your workspace to start managing leads.
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="field">
            <label className="label" htmlFor="name">
              Company name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="e.g. Demo Solar Solutions"
              required
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="subdomain">
              Subdomain
            </label>
            <input
              id="subdomain"
              type="text"
              value={form.subdomain}
              onChange={(e) => setForm({ ...form, subdomain: e.target.value })}
              className="input"
              placeholder="e.g. demo-solar"
              required
            />
            <p className="hint">
              Lowercase letters, numbers, and hyphens. Used for your public calculator URL.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field">
              <label className="label" htmlFor="ownerEmail">
                Owner email
              </label>
              <input
                id="ownerEmail"
                type="email"
                value={form.ownerEmail}
                onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                className="input"
                placeholder="admin@example.com"
                autoComplete="email"
                required
              />
            </div>

            <PasswordInput
              id="password"
              label="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              hint="Minimum 6 characters."
              required
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="websiteUrl">
              Website URL <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="websiteUrl"
              type="url"
              value={form.websiteUrl}
              onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
              className="input"
              placeholder="https://demosolar.com"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading && <Spinner className="h-4 w-4 border-slate-200 border-t-transparent" />}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}