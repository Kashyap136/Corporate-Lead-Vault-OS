'use client';

import { useState } from 'react';

// ---------------------------------------------------------------- Brand

export function Brand({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white">
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
          <path d="M9 13h6" />
        </svg>
      </span>
      <span className="text-sm font-semibold leading-tight text-slate-900">
        Corporate Lead <span className="text-slate-400">Vault OS</span>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------- Spinner

export function Spinner({ className = 'h-4 w-4 border-slate-300 border-t-transparent' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-2 ${className}`}
    />
  );
}

// ---------------------------------------------------------------- Alert

const alertTones = {
  error: 'alert-error',
  success: 'alert-success',
  info: 'alert-info',
  warning: 'alert-warning'
};

export function Alert({ tone = 'error', className = '', children }) {
  return (
    <div className={`alert ${alertTones[tone] || alertTones.error} ${className}`} role={tone === 'error' ? 'alert' : undefined}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- PasswordInput

function EyeIcon({ shown }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      {shown ? (
        <>
          <path d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        </>
      ) : (
        <>
          <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </>
      )}
    </svg>
  );
}

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  hint,
  className = '',
  required
}) {
  const [show, setShow] = useState(false);

  return (
    <div className={`field ${className}`}>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="input pr-10"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:text-slate-900"
        >
          <EyeIcon shown={show} />
        </button>
      </div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------- Select

export function Select({ small, className = '', children, ...props }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <select
        {...props}
        className={`input appearance-none cursor-pointer ${small ? 'py-1.5 pl-2.5 pr-8 text-xs' : 'pr-9'}`}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}