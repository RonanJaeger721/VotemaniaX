import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';
import './globals.css';
const display = Space_Grotesk({ variable: '--font-display', subsets: ['latin'] });
const body = Manrope({ variable: '--font-body', subsets: ['latin'] });
export const metadata: Metadata = { title: 'VoteMania — Every vote moves the moment', description: 'Discover standout talent, cast verified votes, and follow the live leaderboard on VoteMania.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className="dark"><body className={`${display.variable} ${body.variable}`}>{children}</body></html>; }
