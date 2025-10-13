import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import * as React from 'react';

import logoImg from '@/assets/logo.jpg';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Courses', to: '/courses' },
  { label: 'About', to: '/about-us' },
  { label: 'Contact', to: '/contact-us' },
  { label: 'Promotions', to: '/promotions' },
  { label: 'Affiliate', to: '/affiliate-program' },
];

export function NavigationBarComponent() {
  const [open, setOpen] = React.useState(false);

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
          <Link to="/login" className="text-sm font-semibold text-cyan-600 transition hover:text-blue-600">
            Sign In
          </Link>
          <Link
            to="/get-started"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:from-cyan-600 hover:to-blue-700"
          >
            Get Started
          </Link>
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
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-center text-sm font-semibold text-cyan-600 transition hover:bg-cyan-50"
              >
                Sign In
              </Link>
              <Link
                to="/get-started"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-md transition hover:from-cyan-600 hover:to-blue-700"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}