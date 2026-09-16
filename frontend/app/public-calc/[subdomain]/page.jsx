'use client';
import { useState } from 'react';

export default function PublicCalcPage({ params }) {
  const subdomain = params.subdomain;
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

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const companyRes = await fetch(`/api/auth/company?subdomain=${subdomain}`);

      let companyId = null;
      if (companyRes.ok) {
        const compData = await companyRes.json();
        companyId = compData.id;
      }

      const res = await fetch('/api/roi/calculate', {
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
      setResult(data);
      setSubmitted(true);
      setStep(3);
    } catch (err) {
      console.error('Calculation failed');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg text-center">
          <div className="text-5xl mb-4">Thank You!</div>
          <h2 className="text-2xl font-bold mb-2">Your ROI Report</h2>
          <p className="text-gray-500 mb-6">For: {subdomain}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-500">Estimated Savings</p>
              <p className="text-2xl font-bold text-green-600">₹{result?.savings?.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-500">ROI Percentage</p>
              <p className="text-2xl font-bold text-green-600">{result?.roiPercent?.toFixed(1)}%</p>
            </div>
          </div>

          <p className="text-sm text-gray-500">Our team will contact you shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-2">ROI Calculator</h1>
        <p className="text-gray-500 text-center mb-6">Calculate your potential savings</p>

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Factory Area (sq ft)</label>
                <input
                  type="number"
                  value={form.factoryArea}
                  onChange={(e) => setForm({ ...form, factoryArea: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 2000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Power Bill (monthly)</label>
                <input
                  type="number"
                  value={form.powerBill}
                  onChange={(e) => setForm({ ...form, powerBill: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 150000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manpower</label>
                <input
                  type="number"
                  value={form.manpower}
                  onChange={(e) => setForm({ ...form, manpower: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Cost</label>
                <input
                  type="number"
                  value={form.currentCost}
                  onChange={(e) => setForm({ ...form, currentCost: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 500000"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Next
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCalculate}>
            <p className="text-sm text-gray-500 mb-4">Enter your details to see the full report</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your email"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 transition"
              >
                {loading ? 'Calculating...' : 'Get Full Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
