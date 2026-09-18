import { Brand } from './ui';

// Shared layout for the public auth pages (login, signup, forgot/reset password).
export default function AuthShell({ children, wide = false }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="px-4 pt-10 pb-8">
        <div className="flex justify-center">
          <Brand />
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 pb-10">
        <div className={`w-full ${wide ? 'max-w-lg' : 'max-w-md'}`}>{children}</div>
      </main>

      <footer className="pb-6 text-center text-xs text-slate-400">
        Corporate Lead Vault OS &middot; Lead management for industrial projects
      </footer>
    </div>
  );
}