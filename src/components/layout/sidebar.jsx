import { NavLink, useLocation } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { navLinks } from "@/config/navigation";

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden min-h-screen w-[240px] border-r bg-card p-4 lg:flex lg:flex-col">
      <div className="flex items-center gap-2 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
          SN
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Supernova LMS</p>
          <p className="text-lg font-semibold">Admin</p>
        </div>
      </div>
      <nav className="mt-8 space-y-1">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/admin" && location.pathname.startsWith(`${item.href}/`));

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.title}
              </span>
              {item.comingSoon ? <Badge variant="secondary">Soon</Badge> : null}
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
        Phase roadmap tracked across portal sections. Use quick create from top bar to add records.
      </div>
    </aside>
  );
}
