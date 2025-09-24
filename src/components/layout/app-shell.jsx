import * as React from 'react';
import { Outlet } from 'react-router-dom';

import { AppSidebar } from '@/components/layout/sidebar';
import { AppTopbar } from '@/components/layout/topbar';

export function AppShell() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex w-full flex-col">
        <AppTopbar />
        <main className="flex-1 px-4 pb-10 pt-6 md:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
