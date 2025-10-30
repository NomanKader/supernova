import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppTopbar() {
  const navigate = useNavigate();
  const adminProfile = React.useMemo(() => {
    const raw = sessionStorage.getItem("adminUser");
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      sessionStorage.removeItem("adminUser");
      return null;
    }
  }, []);

  const displayName = adminProfile?.name || adminProfile?.email || "Admin";
  const displayRole = adminProfile?.role ? adminProfile.role.charAt(0).toUpperCase() + adminProfile.role.slice(1) : null;

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    navigate("/admin/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-end border-b bg-card/90 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl border border-border bg-background p-1 shadow-sm">
          <ThemeToggle />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-11 gap-2 rounded-xl border border-transparent px-4 text-sm font-semibold text-foreground hover:border-border hover:bg-muted transition-colors"
              aria-label="Account"
            >
              <UserCircle className="h-5 w-5" />
              <span className="flex flex-col items-start leading-none">
                <span>{displayName}</span>
                {displayRole ? (
                  <span className="text-xs font-normal text-muted-foreground">{displayRole}</span>
                ) : null}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Admin
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}


