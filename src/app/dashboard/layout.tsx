import React from 'react';
import type { Metadata } from 'next';
import { DashboardLayout } from '@/components/dashboard/Layout';

export const metadata: Metadata = {
  title: 'Gestion de la bibliothèque',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
        <DashboardLayout>{children}</DashboardLayout>
  );
}
