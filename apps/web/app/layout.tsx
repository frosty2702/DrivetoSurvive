import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from './components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Drive to Survive',
  description: 'Decentralized Motorsport Ecosystem',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="bg-black text-white py-6 mt-12">
            <div className="container mx-auto px-4 text-center text-sm">
              <p>DriveToSurvive - Decentralized Motorsport Ecosystem</p>
              <p className="mt-2">Demo Version</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}