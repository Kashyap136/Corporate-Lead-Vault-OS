'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Brand } from './ui';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/leads', label: 'Leads' },
  { href: '/roi-calc', label: 'ROI Calculator' },
  { href: '/seo', label: 'SEO' },
  { href: '/audit', label: 'Audit' }
];

// Shared authenticated app layout: top bar with brand + logout and the primary
// navigation. Keeps the same design language across every internal page.
export default function AppShell({ title, subtitle, actions, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('company');
      if (raw) {
        const parsed = JSON.parse(raw);
        setCompanyName(parsed.name || parsed.subdomain || '');
      }
    } catch (e) {
      // Ignore malformed stored company data.
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0">
              <Brand />
            </span>
            {companyName && (
              <span className="hidden truncate text-sm font-medium text-slate-400 sm:inline">
                &middot; {companyName}
              </span>
            )}
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm shrink-0">
            Logout
          </button>
        </div>

        <nav aria-label="Primary" className="border-t border-slate-100">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    active
                      ? 'border-blue-600 text-slate-900'
                      : 'border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8 lg:px-8">
        {(title || subtitle || actions) && (
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              {title && (
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
              )}
              {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        )}

        {children}
      </main>
    </div>
  );
}