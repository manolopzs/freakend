import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Freakend — IE Edition',
  description: 'Gamified weekend discovery for IE MBA students in Madrid.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
