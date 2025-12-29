import { Link } from "react-router-dom";

import logoImg from "@/assets/logo.jpg";

const quickLinks = [
  { label: "Home", to: "/" },
  // { label: "Courses", to: "/courses" },
  { label: "About", to: "/about-us" },
  { label: "Contact", to: "/contact-us" },
];

const programs = [
  // { label: 'Promotions', to: '/promotions' },
  // { label: 'Affiliate Program', to: '/affiliate-program' },
  // { label: 'Student Discounts', to: '/promotions' },
  // { label: 'Corporate Training', to: '/courses' },
];

const supportLinks = [
  { label: "Help Center", to: "/contact-us" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
  // { label: "FAQ", to: "/get-started" },
];

export function FooterComponent() {
  return (
    <footer className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-700 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-6">
            <img src={logoImg} alt="Supernova" className="h-16 w-auto rounded-md bg-white/90 object-contain" />
            <p className="text-sm text-cyan-100">
              Empowering learners worldwide with cutting-edge online education. Transform your career with
              our expert-led courses and innovative learning platform.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-cyan-100">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* <div className="space-y-4">
            <h4 className="text-lg font-semibold">Programs</h4>
            <ul className="space-y-2 text-sm text-cyan-100">
              {programs.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-cyan-100">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 text-sm text-cyan-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Supernova LMS. All rights reserved.</p>
            <a href="https://facebook.com/nksoftwareshouse" className="transition hover:text-white">
              Powered by NK Software House
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}







