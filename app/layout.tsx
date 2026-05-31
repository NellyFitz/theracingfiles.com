import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PrintShift — The Digital Parts Bin for Enthusiast Vehicles',
  description:
    'Buy verified 3D printable files, order pre-printed parts, or request fully finished components for cars and bikes.',
  keywords: ['3D printing', 'car parts', 'motorcycle parts', 'STL', 'printable parts', 'aftermarket'],
  openGraph: {
    title: 'PrintShift — The Digital Parts Bin for Enthusiast Vehicles',
    description: 'Verified 3D printable parts for cars and motorcycles.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0d0d0d] text-white">
        <Navbar />
        <div className="pt-16 flex flex-col flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
