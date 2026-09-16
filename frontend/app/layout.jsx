import './globals.css';

export const metadata = {
  title: 'Corporate Lead Vault OS',
  description: 'Lead Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
