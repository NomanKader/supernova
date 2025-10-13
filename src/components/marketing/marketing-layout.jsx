import { Outlet } from 'react-router-dom';

import { FooterComponent } from '@/components/FooterComponent';
import { NavigationBarComponent } from '@/components/NavigationBarComponent';

export function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavigationBarComponent />
      <main className="flex-1">
        <Outlet />
      </main>
      <FooterComponent />
    </div>
  );
}
