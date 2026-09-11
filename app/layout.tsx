import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';
import './globals.css';
import './brand-v2.css';
const display = Space_Grotesk({
  variable: '--font-display',
  subsets: ['latin'],
});
const body = Manrope({ variable: '--font-body', subsets: ['latin'] });
export const metadata: Metadata = {
  title: 'Vote in this week’s round | VoteManiaX',
  description:
    'Vote in live seven-day competition rounds, follow verified rankings, and revisit permanent results on VoteManiaX.',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
