'use client';
import { useState, useEffect } from 'react';
import { Alert, Spinner } from '../../../components/ui';
import { apiUrl } from '../../../lib/api';
import { formatIndianNumber } from '../../../lib/format';

const STEPS = [
  { n: 1, label: 'Project details' },
  { n: 2, label: 'Contact info' },
  { n: 3, label: 'Results' }
];

export default function PublicCalcPage({ params }) {
  const subdomain = params.subdomain;
  const [companyName, setCompanyName] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    factoryArea: '',
    powerBill: '',
    manpower: '',
    currentCost: '',
    name: '',
    phone: '',
    email: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl(`/api/auth/company?subdomain=${subdomain}`));
        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            setCompanyName(data.name || subdomain);
            setInvalid(false);
          } else {
            setInvalid(true);
          }
        }
      } catch (err) {
        if (!cancelled) setInvalid(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [subdomain]);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const companyRes = await fetch(apiUrl(`/api/auth/company?subdomain=${subdomain}`));

      let companyId = null;
      if (companyRes.ok) {
        const compData = await companyRes.json();
        companyId = compData.id;
        setCompanyName(compData.name || subdomain);
      }

      if (!companyId) {
        setError('This calculator link is invalid. Please contact the company.');
        setLoading(false);
        return;
      }

      const res = await fetch(apiUrl('/api/roi/calculate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          factoryArea: parseFloat(form.factoryArea),
          powerBill: parseFloat(form.powerBill),
          manpower: parseFloat(form.manpower),
          currentCost: parseFloat(form.currentCost),
          name: form.name,
          phone: form.phone,
          email: form.email
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      setResult(data);
      setSubmitted(true);
      setStep(3);
    } catch (err) {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  if (invalid) {
    return (
      <div className="flex min-h-screen items-start justify-center bg-slate-50 px-4 pt-20">
        <div className="w-full max-w-md">
          <div className="card p-6 text-center sm:p-8">
            <h1 className="text-lg font-semibold text-slate-900">Calculator not found</h1>
            <p className="mt-1 text-sm text-slate-500">
              This calculator link is invalid or no longer available. Please contact the company
              directly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <div className="flex flex-1 items-start justify-center px-4 py-10">
          <div className="w-full max-w-lg text-center">
            <div className="card p-6 sm:p-8">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <h1 className="mt-4 text-xl font-semibold text-slate-900">Thank you!</h1>
              <p className="mt-1 text-sm text-slate-500">
                Your ROI report{companyName ? ` for ${companyName}` : ''} is ready.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-emerald-50 p-4 ring-1 ring-inset ring-emerald-200">
                  <p className="text-sm font-medium text-emerald-800">Estimated Savings</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">
                    ₹{formatIndianNumber(result?.savings)}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4 ring-1 ring-inset ring-blue-200">
                  <p className="text-sm font-medium text-blue-800">ROI</p>
                  <p className="mt-1 text-2xl font-bold text-blue-700">
                    {result?.roiPercent?.toFixed(1)}%
                  </p>
                </div>
              </div>

              <p className="mt-6 text-sm text-slate-500">
                Our team will contact you shortly.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-lg items-center justify-between px-4 py-4 sm:px-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M3 8.5 12 3l9 5.5" />
              <path d="M5 9.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9.5" />
            </svg>
          </span>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">
              {companyName || subdomain}
            </p>
            <p className="text-xs text-slate-400">ROI Calculator</p>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-lg">
          <ol className="mb-6 flex items-center gap-1 text-xs font-medium" aria-label="Progress">
            {STEPS.map((s, i) => (
              <li key={s.n} className="flex flex-1 items-center gap-1">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
                    step === s.n
                      ? 'bg-blue-600 text-white'
                      : step > s.n
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step > s.n ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    s.n
                  )}
                </span>
                <span
                  className={`hidden sm:block ${step >= s.n ? 'text-slate-700' : 'text-slate-400'}`}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="mx-1 h-px flex-1 bg-slate-200" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>

          <div className="card p-5 sm:p-8">
            <h1 className="text-xl font-semibold text-slate-900">
              {step === 1 && 'Calculate your potential savings'}
              {step === 2 && 'Your details'}
              {step === 3 && 'Your results'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {step === 1 &&
                'Enter your site details below. This takes less than a minute.'}
              {step === 2 && 'We will use these to reach out with your full ROI report.'}
            </p>

            {step === 1 && (
              <form
                className="mt-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setStep(2);
                }}
              >
                <div className="field">
                  <label className="label" htmlFor="factory-area">
                    Factory Area (sq ft)
                  </label>
                  <input
                    id="factory-area"
                    type="number"
                    value={form.factoryArea}
                    onChange={(e) => setForm({ ...form, factoryArea: e.target.value })}
                    className="input"
                    placeholder="e.g. 2000"
                    required
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="power-bill">
                    Power Bill (monthly)
                  </label>
                  <input
                    id="power-bill"
                    type="number"
                    value={form.powerBill}
                    onChange={(e) => setForm({ ...form, powerBill: e.target.value })}
                    className="input"
                    placeholder="e.g. 150000"
                    required
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="manpower">
                    Manpower
                  </label>
                  <input
                    id="manpower"
                    type="number"
                    value={form.manpower}
                    onChange={(e) => setForm({ ...form, manpower: e.target.value })}
                    className="input"
                    placeholder="e.g. 10"
                    required
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="current-cost">
                    Current Cost
                  </label>
                  <input
                    id="current-cost"
                    type="number"
                    value={form.currentCost}
                    onChange={(e) => setForm({ ...form, currentCost: e.target.value })}
                    className="input"
                    placeholder="e.g. 500000"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  Next
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleCalculate} className="mt-6 space-y-4">
                {error && (
                  <div>
                    <Alert tone="error">{error}</Alert>
                  </div>
                )}
                <div className="field">
                  <label className="label" htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="phone">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input"
                    placeholder="Your phone number"
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
                    placeholder="Your email"
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                    {loading && <Spinner className="h-4 w-4 border-slate-200 border-t-transparent" />}
                    {loading ? 'Calculating…' : 'Get Full Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="pb-6 text-center text-xs text-slate-400">
        {companyName ? `${companyName} · ` : ''}ROI Calculator
      </footer>
    </div>
  );
}