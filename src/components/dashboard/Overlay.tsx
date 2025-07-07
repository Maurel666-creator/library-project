'use client';

import { useDashboardContext } from './Provider';

export function Overlay() {
  const { isOpen, closeSidebar } = useDashboardContext();
  return (
    <div
      onClick={closeSidebar}
      className={
        isOpen
          ? 'fixed left-0 top-0 z-30 h-screen w-screen bg-gray-200 opacity-40 lg:bg-transparent'
          : ''
      }
    />
  );
}