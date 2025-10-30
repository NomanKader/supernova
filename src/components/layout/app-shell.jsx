import * as React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { AppSidebar } from '@/components/layout/sidebar';
import { AppTopbar } from '@/components/layout/topbar';

export function AppShell() {
  const navigate = useNavigate();
  const [canRender, setCanRender] = React.useState(false);

  React.useEffect(() => {
    const adminToken = sessionStorage.getItem('adminToken');
    const rawUser = sessionStorage.getItem('adminUser');
    let isAdmin = false;

    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        if (parsed && typeof parsed.role === 'string') {
          isAdmin = parsed.role.toLowerCase() === 'admin';
        }
      } catch (_error) {
        sessionStorage.removeItem('adminUser');
      }
    }

    if (!adminToken || !isAdmin) {
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');
      navigate('/admin/login', { replace: true });
      return;
    }

    setCanRender(true);
  }, [navigate]);

  if (!canRender) {
    return null;
  }

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
