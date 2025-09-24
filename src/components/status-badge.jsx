import { Badge } from '@/components/ui/badge';

const statusVariantMap = {
  active: 'default',
  published: 'default',
  live: 'default',
  approved: 'default',
  completed: 'default',
  draft: 'secondary',
  scheduled: 'secondary',
  invited: 'secondary',
  onboarding: 'secondary',
  pending: 'outline',
  paused: 'outline',
  archived: 'outline',
  ended: 'outline',
  'awaiting-review': 'outline',
  review: 'outline',
  declined: 'destructive',
  rejected: 'destructive',
  failed: 'destructive',
  suspended: 'destructive',
};

export function StatusBadge({ status = '' }) {
  const key = status.toLowerCase();
  const variant = statusVariantMap[key] ?? 'secondary';
  const label = key.replace(/-/g, ' ');
  return <Badge variant={variant}>{label}</Badge>;
}
