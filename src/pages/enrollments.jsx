import * as React from 'react';
import { Check, Image as ImageIcon, Loader2, X } from 'lucide-react';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { enrollments, users, courses } from '@/data/mock-data';

const tableData = enrollments.map((enrollment) => {
  const learner = users.find((user) => user.id === enrollment.userId);
  const course = courses.find((item) => item.id === enrollment.courseId);
  return {
    ...enrollment,
    learnerName: learner?.name ?? 'Unknown learner',
    courseTitle: course?.title ?? 'Unknown course',
  };
});

const columns = [
  {
    header: 'Learner',
    accessorKey: 'learnerName',
  },
  {
    header: 'Course',
    accessorKey: 'courseTitle',
  },
  {
    header: 'Status',
    accessorKey: 'paymentStatus',
    cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} />,
  },
  {
    header: 'Progress',
    accessorKey: 'progress',
    cell: ({ row }) => `${row.original.progress}%`,
  },
  {
    header: 'Enrolled',
    accessorKey: 'enrolledAt',
    cell: ({ row }) => new Date(row.original.enrolledAt).toLocaleDateString(),
  },
];

export default function EnrollmentsPage() {
  const quickActionsRef = React.useRef(null);
  const [reviewedId, setReviewedId] = React.useState(null);
  const reviewedEnrollment = reviewedId ? tableData.find((row) => row.id === reviewedId) : undefined;

  const pending = tableData.filter((row) => row.paymentStatus === 'pending');
  const approved = tableData.filter((row) => row.paymentStatus === 'approved');
  const completionRate = (
    tableData.reduce((acc, row) => acc + row.progress, 0) / Math.max(tableData.length, 1)
  ).toFixed(0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manual enrollments"
        description="Review payment proofs, approve enrollments and monitor learner progress."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{pending.length}</div>
            <p className="text-sm text-muted-foreground">Manual receipts awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved this week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{approved.length}</div>
            <p className="text-sm text-muted-foreground">Learners granted access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Average completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{completionRate}%</div>
            <p className="text-sm text-muted-foreground">Across manually enrolled learners</p>
          </CardContent>
        </Card>
        <Card
          role="button"
          tabIndex="0"
          onClick={() => quickActionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              quickActionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
          className="cursor-pointer transition hover:border-primary"
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Receipts on file</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{tableData.filter((row) => row.paymentProof).length}</div>
            <p className="text-sm text-muted-foreground">Screenshots stored for audit</p>
          </CardContent>
        </Card>
      </section>

      <div className="rounded-lg border bg-card p-4">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div>
            <h2 className="text-lg font-semibold">Enrollment queue</h2>
            <p className="text-sm text-muted-foreground">
              Prioritize screenshot approvals to unlock course access.
            </p>
          </div>
          {pending.length > 0 ? (
            <Badge variant="secondary">{pending.length} pending</Badge>
          ) : null}
        </header>
        <DataTable columns={columns} data={tableData} searchPlaceholder="Search enrollment" />
      </div>

      <div ref={quickActionsRef} className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Quick actions</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {pending.map((row) => (
            <div key={row.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-semibold">{row.learnerName}</p>
                <p className="text-xs text-muted-foreground">{row.courseTitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => { setReviewedId(row.id); quickActionsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                  aria-label="Review proof"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Approve">
                  <Check className="h-4 w-4 text-emerald-600" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Reject">
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {pending.length === 0 ? (
            <div className="col-span-full flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Nothing waiting for manual review.
            </div>
          ) : null}
        </div>
      </div>

      <Dialog open={Boolean(reviewedEnrollment)} onOpenChange={(isOpen) => !isOpen && setReviewedId(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Payment proof</DialogTitle>
            <DialogDescription>
              Validate the learner submission and approve or reject enrollment.
            </DialogDescription>
          </DialogHeader>
          {reviewedEnrollment ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <p className="font-medium">{reviewedEnrollment.learnerName}</p>
                <p className="text-muted-foreground">{reviewedEnrollment.courseTitle}</p>
                <p className="text-xs text-muted-foreground">
                  Submitted {new Date(reviewedEnrollment.enrolledAt).toLocaleString()}
                </p>
              </div>
              {reviewedEnrollment.paymentProof ? (
                <img
                  src={reviewedEnrollment.paymentProof}
                  alt="Payment proof"
                  className="h-auto w-full rounded-md border object-cover"
                />
              ) : (
                <div className="flex items-center justify-center rounded-md border border-dashed p-12 text-sm text-muted-foreground">
                  No screenshot uploaded
                </div>
              )}
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setReviewedId(null)}>
              Close
            </Button>
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
              Reject
            </Button>
            <Button>Approve enrollment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



