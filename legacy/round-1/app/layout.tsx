import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Meesho ReLoop Prototype',
  description: 'Interactive desktop prototype for Meesho ReLoop and Meesho Source.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
