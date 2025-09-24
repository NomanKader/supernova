import * as React from 'react';
import { ExclamationTriangleIcon, InfoCircledIcon, CheckCircledIcon } from '@radix-ui/react-icons';

import { cn } from '@/lib/utils';

const icons = {
  default: InfoCircledIcon, destructive, success,
};

const Alert = React.forwardRef(({ className, variant = 'default', children, ...props }, ref) => {
  const Icon = icons[variant] ?? icons.default;
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'relative w-full rounded-lg border border-border bg-card p-4 text-sm text-card-foreground shadow-sm',
        variant === 'destructive' && 'border-destructive/50 text-destructive',
        variant === 'success' && 'border-primary/40 text-primary',
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4" />
        <div className="space-y-1">{children}</div>
      </div>
    </div>
  );
});
Alert.displayName = 'Alert';

const AlertTitle = ({ className, ...props }) => (
  <h5 className={cn('text-sm font-semibold leading-none', className)} {...props} />
);

const AlertDescription = ({ className, ...props }) => (
  <div className={cn('text-sm text-muted-foreground', className)} {...props} />
);

export { Alert, AlertTitle, AlertDescription };





