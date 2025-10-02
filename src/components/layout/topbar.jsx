import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, Plus, Search, UserCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { navLinks } from '@/config/navigation';

export function AppTopbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    navigate('/admin/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
      <div className="flex w-full items-center gap-3 lg:gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Navigate</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {navLinks.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link to={item.href} className={location.pathname === item.href ? 'font-semibold' : undefined}>
                  {item.title}
                  {item.comingSoon ? <span className="ml-auto text-xs text-muted-foreground">Soon</span> : null}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex flex-1 items-center gap-2 rounded-md border px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search people, courses or actions"
            className="h-9 border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Quick Add</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {navLinks.slice(1, 7).map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link to={item.href}>Create {item.title}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="items-center gap-2"
              aria-label="View profile"
            >
              <UserCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}










