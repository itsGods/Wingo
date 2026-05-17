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
  title: "LUCKY WINGO | India's Most Trusted Color Prediction & Mines Game",
  description: "Join LUCKY WINGO, the premier destination for real-time betting! Play Wingo color prediction, Mines, and more. Fast cashouts, secure platform, and 24/7 gameplay.",
  keywords: 'lucky wingo, wingo game, color prediction, mines game, crypto betting, real-time game, win go, play online',
  metadataBase: new URL('https://luckywingo.eu.cc'),
  openGraph: {
    title: 'LUCKY WINGO | Play Wingo & Mines',
    description: 'Join the premier destination for real-time betting! Play Wingo, Mines, and more.',
    url: 'https://luckywingo.eu.cc',
    siteName: 'LUCKY WINGO',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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

