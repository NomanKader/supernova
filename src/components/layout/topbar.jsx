import { useNavigate } from "react-router-dom";
import { UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppTopbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
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
              Admin
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}


