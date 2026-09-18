'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import { Alert, Spinner } from '../../components/ui';
import { authFetch } from '../../lib/api';
import { formatIndianNumber } from '../../lib/format';

export default function ROICalcPage() {
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({ factoryArea: '', powerBill: '', manpower: '', currentCost: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const comp = localStorage.getItem('company');
    if (!token) {
      router.push('/login');
      return;
    }
    setCompany(JSON.parse(comp));
  }, [router]);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authFetch('/api/roi/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company?.id,
          factoryArea: parseFloat(form.factoryArea),
          powerBill: parseFloat(form.powerBill),
          manpower: parseFloat(form.manpower),
          currentCost: parseFloat(form.currentCost)
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to calculate results.');
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error('Calculation failed');
      setError('Connection error. Please try again.');
      setResult(null);
    }
    setLoading(false);
  };

  const inputProps = {
    type: 'number',
    required: true,
    className: 'input'
  };

  return (
    <AppShell
      title="ROI Calculator"
      subtitle="Estimate savings and return on investment for a client."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">Project details</h2>
          <p className="mt-1 text-sm text-slate-500">Enter the site parameters to compute ROI.</p>

          {error && (
            <div className="mt-4">
              <Alert tone="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleCalculate} className="mt-5 space-y-4">
            <div className="field">
              <label className="label" htmlFor="factory-area">
                Factory Area (sq ft)
              </label>
              <input
                id="factory-area"
                {...inputProps}
                value={form.factoryArea}
                onChange={(e) => setForm({ ...form, factoryArea: e.target.value })}
                placeholder="e.g. 2000"
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="power-bill">
                Power Bill (monthly, ₹)
              </label>
              <input
                id="power-bill"
                {...inputProps}
                value={form.powerBill}
                onChange={(e) => setForm({ ...form, powerBill: e.target.value })}
                placeholder="e.g. 150000"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="field">
                <label className="label" htmlFor="manpower">
                  Manpower
                </label>
                <input
                  id="manpower"
                  {...inputProps}
                  value={form.manpower}
                  onChange={(e) => setForm({ ...form, manpower: e.target.value })}
                  placeholder="e.g. 10"
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="current-cost">
                  Current Cost (₹)
                </label>
                <input
                  id="current-cost"
                  {...inputProps}
                  value={form.currentCost}
                  onChange={(e) => setForm({ ...form, currentCost: e.target.value })}
                  placeholder="e.g. 500000"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading && <Spinner className="h-4 w-4 border-slate-200 border-t-transparent" />}
              {loading ? 'Calculating…' : 'Calculate ROI'}
            </button>
          </form>
        </div>

        <div className="card p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">Results</h2>
          <p className="mt-1 text-sm text-slate-500">
            Estimated savings and return for this project.
          </p>

          {result ? (
            <dl className="mt-5 space-y-4">
              <div className="rounded-lg bg-emerald-50 p-4 ring-1 ring-inset ring-emerald-200">
                <dt className="text-sm font-medium text-emerald-800">Annual Savings</dt>
                <dd className="mt-1 text-3xl font-bold tracking-tight text-emerald-700">
                  ₹{formatIndianNumber(result.savings)}
                </dd>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 ring-1 ring-inset ring-blue-200">
                <dt className="text-sm font-medium text-blue-800">ROI</dt>
                <dd className="mt-1 text-3xl font-bold tracking-tight text-blue-700">
                  {result.roiPercent?.toFixed(1)}%
                </dd>
              </div>

              {result.logRetentionUntil && (
                <p className="text-xs text-slate-400">
                  This calculation was logged for your audit trail.
                </p>
              )}
            </dl>
          ) : (
            <div className="mt-5 flex flex-col items-center rounded-lg border border-dashed border-slate-200 px-6 py-12 text-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-slate-300"
                aria-hidden="true"
              >
                <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
              <p className="mt-3 text-sm font-medium text-slate-600">No results yet</p>
              <p className="mt-1 text-sm text-slate-400">
                Fill in the project details and run the calculation.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}