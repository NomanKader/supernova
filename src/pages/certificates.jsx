import * as React from 'react';
import { Award, BadgeCheck, Shield } from 'lucide-react';

import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { certificateRequests, users, courses } from '@/data/mock-data';

const rows = certificateRequests.map((request) => {
  const learner = users.find((user) => user.id === request.userId);
  const course = courses.find((item) => item.id === request.courseId);
  return {
    ...request,
    learner: learner?.name ?? 'Unknown learner',
    course: course?.title ?? 'Untitled course',
  };
});

const columns = [
  {
    header: 'Learner',
    accessorKey: 'learner',
  },
  {
    header: 'Course',
    accessorKey: 'course',
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    header: 'Requested',
    accessorKey: 'requestedAt',
    cell: ({ row }) => new Date(row.original.requestedAt).toLocaleDateString(),
  },
  {
    header: 'Issued',
    accessorKey: 'issuedAt',
    cell: ({ row }) => (row.original.issuedAt ? new Date(row.original.issuedAt).toLocaleDateString() : '-'),
  },
];

export default function CertificatesPage() {
  const [selectedId, setSelectedId] = React.useState(null);
  const selected = selectedId ? rows.find((row) => row.id === selectedId) : undefined;

  const pending = rows.filter((row) => row.status === 'awaiting-review');
  const issued = rows.filter((row) => row.status === 'issued');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        description="Manage issuance workflow after assessments pass and keep audit trail."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Awaiting review</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{pending.length}</div>
            <CardDescription>Requests pending instructor approval</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Issued</CardTitle>
            <BadgeCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{issued.length}</div>
            <CardDescription>Certificates granted to learners</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Automation ready</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">Q4</div>
            <CardDescription>Target for auto-issuance after grading</CardDescription>
          </CardContent>
        </Card>
      </section>

      <div className="rounded-lg border bg-card p-4">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div>
            <h2 className="text-lg font-semibold">Certificate requests</h2>
            <p className="text-sm text-muted-foreground">
              Review learner eligibility before generating digital certificates.
            </p>
          </div>
          {pending.length > 0 ? <Badge variant="secondary">{pending.length} awaiting action</Badge> : null}
        </header>
        <DataTable columns={columns} data={rows} searchPlaceholder="Search requests" />
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Recent activity</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-semibold">{row.learner}</p>
                <p className="text-xs text-muted-foreground">{row.course}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={row.status} />
                <Button size="sm" variant="outline" onClick={() => setSelectedId(row.id)}>
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Certificate details</DialogTitle>
            <DialogDescription>Confirm eligibility and send certificate to learner.</DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="font-semibold">{selected.learner}</p>
                <p className="text-muted-foreground">{selected.course}</p>
                <p className="text-xs text-muted-foreground">
                  Requested {new Date(selected.requestedAt).toLocaleString()}
                </p>
              </div>
              <p>
                Assessment completion: <strong>{selected.assessmentId}</strong>
              </p>
              <div className="flex items-center gap-2">
                <span>Current status:</span>
                <StatusBadge status={selected.status} />
              </div>
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedId(null)}>
              Close
            </Button>
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
              Decline
            </Button>
            <Button>Issue certificate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
