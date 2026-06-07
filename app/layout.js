import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/hooks/useTheme';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import VisitorTracker from '@/components/VisitorTracker';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'JAYAMBE INTEGRATORS | Electrical, Electronic & CCTV Systems in Boisar',
  description:
    'JAYAMBE INTEGRATORS (Boisar, Palghar) specializes in CCTV, intercom systems, microwave oven & induction servicing, geyser & stabilizer troubleshooting, VFD drives, and control panel engineering.',
  keywords:
    'JAYAMBE INTEGRATORS, Er. Anand, Boisar, Palghar, CCTV installation Boisar, intercom system Boisar, electrical services Boisar, VFD drives Boisar, control panels, geyser stabilizer repair, electrical troubleshooting Boisar',
  authors: [{ name: 'JAYAMBE INTEGRATORS' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-150 transition-colors duration-300"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <VisitorTracker />
          <Navbar />
          <div className="flex-grow">{children}</div>
          <Footer />
          <WhatsAppFloat />
        </ThemeProvider>
      </body>
    </html>
  );
}
