import { Link, NavLink } from 'react-router-dom';
import { Menu, Rocket, X } from 'lucide-react';
import * as React from 'react';

import { useAuth } from '@/components/marketing/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Courses', to: '/courses' },
  { label: 'About', to: '/about-us' },
  { label: 'Contact', to: '/contact-us' },
];

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const { isAuthenticated, isSubscribed, logout } = useAuth();

  const authBadge = isAuthenticated ? (
    <Badge variant={isSubscribed ? 'default' : 'secondary'} className="text-xs">
      {isSubscribed ? 'Subscribed' : 'Free tier'}
    </Badge>
  ) : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Rocket className="h-5 w-5" />
          </span>
          Supernova LMS
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'transition-colors hover:text-foreground/80',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {authBadge}
          {isAuthenticated ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/courses">My courses</Link>
              </Button>
              <Button variant="outline" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      {open ? (
        <div className="border-t bg-background/95 md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-2 py-2 font-medium transition-colors hover:bg-muted',
                    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              {authBadge}
              {isAuthenticated ? (
                <>
                  <Button variant="outline" asChild onClick={() => setOpen(false)}>
                    <Link to="/courses">My courses</Link>
                  </Button>
                  <Button variant="ghost" onClick={() => { logout(); setOpen(false); }}>
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/login" onClick={() => setOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register" onClick={() => setOpen(false)}>
                      Create account
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
