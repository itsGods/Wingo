import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import AuthGuard from '@/components/AuthGuard';
import WinPopupManager from '@/components/WinPopupManager';
import LosePopupManager from '@/components/LosePopupManager';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'], 
  variable: '--font-display' 
});

export const metadata: Metadata = {
  title: '51Game Wingo | Real-time Color Prediction Game',
  description: 'Join the premier Wingo color prediction game. Bet on red, green, violet, numbers or size. Real-time gameplay with 1, 3, 5, and 10 minute intervals.',
  keywords: '51game, wingo, color prediction, betting, real-time game, win go, earn money',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="bg-gray-100 min-h-screen text-slate-900 font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          <AuthGuard>
            <div className="mx-auto w-full max-w-md bg-white min-h-screen shadow-2xl overflow-hidden relative pb-20">
              {children}
              <WinPopupManager />
              <LosePopupManager />
            </div>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}

