import { Link } from 'react-router-dom';

const footerLinks = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
  { label: 'Support', to: '/contact-us' },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold">Supernova LMS</p>
          <p className="text-sm text-muted-foreground">
            Elevating community learning with hands-on programs and mentor-led cohorts.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {footerLinks.map((link) => (
            <Link key={link.label} to={link.to} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
