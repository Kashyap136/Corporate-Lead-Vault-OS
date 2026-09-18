'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthShell from '../../components/AuthShell';
import { Alert, PasswordInput, Spinner } from '../../components/ui';
import { apiUrl } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ subdomain: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain: form.subdomain,
          email: form.email,
          password: form.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('company', JSON.stringify(data.company));
      router.push('/dashboard');
    } catch (err) {
      setError('Connection error');
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="card p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-slate-900">Sign in to your account</h1>
          <p className="mt-1 text-sm text-slate-500">Access your lead management workspace.</p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
              autoComplete="username"
              required
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              placeholder="admin@demo.com"
              autoComplete="email"
              required
            />
          </div>

          <PasswordInput
            id="password"
            label="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading && <Spinner className="h-4 w-4 border-slate-200 border-t-transparent" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700">
            Create one
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}