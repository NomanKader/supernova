import * as React from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PageHeader({ title, description, actionLabel, actionHref, actionIcon, children }) {
  const action = actionLabel
    ? actionHref
      ? (
          <Button asChild>
            <Link to={actionHref} className="flex items-center gap-2">
              {actionIcon}
              <span>{actionLabel}</span>
            </Link>
          </Button>
        )
      : (
          <Button className="flex items-center gap-2">
            {actionIcon}
            <span>{actionLabel}</span>
          </Button>
        )
    : null;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className={cn('text-2xl font-semibold tracking-tight')}>{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {children}
        {action}
      </div>
    </div>
  );
}





