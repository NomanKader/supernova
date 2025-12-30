import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import * as React from 'react';

import logoImg from '@/assets/logo.jpg';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/marketing/auth-context';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Courses', to: '/courses' },
  { label: 'About', to: '/about-us' },
  { label: 'Contact', to: '/contact-us' },
  // { label: 'Promotions', to: '/promotions' },
  // { label: 'Affiliate', to: '/affiliate-program' },
];

export function NavigationBarComponent() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const initials = React.useMemo(() => {
    if (user?.email && typeof user.email === 'string') {
      return user.email.trim().charAt(0).toUpperCase();
    }
    return 'U';
  }, [user?.email]);

  const emailLabel = user?.email ?? 'Account';

  const handleLogout = React.useCallback(() => {
    logout();
    setOpen(false);
    navigate('/');
  }, [logout, navigate]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/60 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-4">
          <img src={logoImg} alt="Supernova" className="h-14 w-auto object-contain" />
        </Link>

        <nav className="hidden items-center gap-10 text-sm font-semibold md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "relative inline-flex pb-2 transition-colors hover:text-cyan-600 after:absolute after:left-0 after:top-full after:h-[3px] after:w-full after:rounded-full after:bg-gradient-to-r after:from-cyan-500 after:to-blue-600 after:content-[''] after:opacity-0 after:transition-opacity after:duration-200",
                  isActive ? 'text-cyan-600 after:opacity-100' : 'text-slate-700'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/courses"
                className="relative inline-flex items-center pb-2 text-sm font-semibold text-cyan-600 transition hover:text-blue-600"
              >
                My Courses
              </Link>
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-semibold text-white shadow-md">
                  {initials}
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="text-xs font-medium text-slate-500">Signed in</span>
                  <span className="max-w-[160px] truncate text-xs font-semibold text-slate-700">
                    {emailLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-semibold text-cyan-600 transition hover:text-blue-600"
                >
                  Log out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-cyan-600 transition hover:text-blue-600">
                Sign In
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-200 text-cyan-600 transition hover:border-cyan-400 hover:text-cyan-700 md:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-cyan-100 bg-white md:hidden">
          <nav className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-4 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 font-medium transition hover:bg-cyan-50',
                    isActive ? 'bg-cyan-50 text-cyan-600' : 'text-slate-600'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 rounded-lg border border-cyan-100 bg-cyan-50/40 px-3 py-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-semibold text-white">
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-700">{emailLabel}</p>
                      <p className="text-xs text-slate-500">Signed in</p>
                    </div>
                  </div>
                  <Link
                    to="/courses"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-center text-sm font-semibold text-cyan-600 transition hover:bg-cyan-50"
                  >
                    My Courses
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg px-3 py-2 text-center text-sm font-semibold text-cyan-600 transition hover:bg-cyan-50"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-center text-sm font-semibold text-cyan-600 transition hover:bg-cyan-50"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

