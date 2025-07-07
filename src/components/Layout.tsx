'use client';

import React from 'react';
import Header from './header';
import Footer from './footer';
import TopBanner from './topBanner';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname.includes('/dashboard')

  return (
    isDashboard
      ?
      <div>
        <main className='bg-white overflow-auto'>
          {children}
        </main>
      </div>
      :
      <div className="flex flex-col min-h-screen">
        <TopBanner />
        <Header />

        <main className="flex-1 bg-white overflow-y-auto">
          {children}
        </main>

        <Footer />
      </div>
  );
}
