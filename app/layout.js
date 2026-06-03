import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/hooks/useTheme';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Jai Ambe Intigrator | New & Refurbished Laptops, CCTV & Tech in Boisar',
  description:
    'Jai Ambe Intigrator (Boisar, Palghar) provides high-quality brand new and refurbished laptops, computers, CCTV surveillance cameras, printers, and networking solutions at the best prices. Contact us for inquiries.',
  keywords:
    'Jai Ambe Intigrator, Boisar, Palghar, refurbished laptops Boisar, CCTV installation Boisar, computer shop Boisar, used laptops, printers Boisar, networking systems Palghar',
  authors: [{ name: 'Jai Ambe Intigrator' }],
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
      <body className="min-h-full flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-150 transition-colors duration-300">
        <ThemeProvider>
          <Navbar />
          <div className="flex-grow">{children}</div>
          <Footer />
          <WhatsAppFloat />
        </ThemeProvider>
      </body>
    </html>
  );
}
