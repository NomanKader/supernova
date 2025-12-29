import * as React from 'react';
import { Check, Image as ImageIcon, Loader2, Plus, RefreshCcw, X } from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiFetch, BUSINESS_NAME } from '@/config/api';
import { buildAssetUrl, formatPriceLabel } from '@/utils/course';

const PAYMENT_LABELS = {
  wave: 'Wave Money',
  kpay: 'KPay',
};

const REVIEW_DECISION_META = {
  pending: {
    label: 'Pending',
    helper: 'Send the proof back to the queue. Reviewer details are cleared so another admin can pick it up.',
    noteHelper: 'Optional note for context (cleared when the request returns to pending).',
    placeholder: 'Add optional context for the next reviewer.',
  },
  approved: {
    label: 'Approved',
    helper: 'Grant course access immediately for this learner.',
    noteHelper: 'Optional message recorded with the approval.',
    placeholder: 'Share optional notes for the learner (visible in the app).',
  },
  rejected: {
    label: 'Rejected',
    helper: 'Reject the screenshot and halt access until a new proof is reviewed.',
    noteHelper: 'Share the reason shown to the learner. Required when rejecting.',
    placeholder: 'Explain why the payment proof is rejected (required).',
  },
};

const MANUAL_GRANT_METHODS = [
  { value: 'campus', label: 'On-campus enrollment' },
  { value: 'admin', label: 'Admin override' },
  { value: 'scholarship', label: 'Scholarship / waiver' },
];

function useAdminProfile() {
  return React.useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const raw = sessionStorage.getItem('adminUser');
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch {
      sessionStorage.removeItem('adminUser');
      return null;
    }
  }, []);
}

export default function EnrollmentsPage() {
  const quickActionsRef = React.useRef(null);
  const adminProfile = useAdminProfile();
  const reviewerName = adminProfile?.name || adminProfile?.email || 'Admin reviewer';
  const reviewerId = adminProfile?.id || null;

  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [error, setError] = React.useState('');
  const [metrics, setMetrics] = React.useState({
    pendingCount: 0,
    approvedThisWeek: 0,
    approvalRate: 0,
    receiptsCount: 0,
  });
  const [reviewedId, setReviewedId] = React.useState(null);
  const [reviewDecision, setReviewDecision] = React.useState('approved');
  const [reviewNotes, setReviewNotes] = React.useState('');
  const [reviewError, setReviewError] = React.useState('');
  const [reviewSubmitting, setReviewSubmitting] = React.useState(false);
  const [learners, setLearners] = React.useState([]);
  const [courses, setCourses] = React.useState([]);
  const [optionsLoading, setOptionsLoading] = React.useState(true);
  const [optionsError, setOptionsError] = React.useState('');
  const [grantDialogOpen, setGrantDialogOpen] = React.useState(false);
  const [selectedLearnerId, setSelectedLearnerId] = React.useState('');
  const [selectedCourseId, setSelectedCourseId] = React.useState('');
  const [grantMethod, setGrantMethod] = React.useState('campus');
  const [grantTransactionId, setGrantTransactionId] = React.useState(() => `ADMIN-${Date.now()}`);
  const [grantNotes, setGrantNotes] = React.useState('');
  const [grantError, setGrantError] = React.useState('');
  const [grantSuccess, setGrantSuccess] = React.useState('');
  const [grantSubmitting, setGrantSubmitting] = React.useState(false);

  const fetchRequests = React.useCallback(
    async (showPrimarySpinner = true) => {
      if (showPrimarySpinner) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError('');

      try {
        const params = new URLSearchParams();
        if (BUSINESS_NAME) {
          params.set('businessName', BUSINESS_NAME);
        }
        const query = params.toString();
        const response = await apiFetch(`/api/enrollments/manual${query ? `?${query}` : ''}`);
        const payload = Array.isArray(response?.data) ? response.data : [];
        setRequests(payload);
        setMetrics({
          pendingCount:
            typeof response?.meta?.pendingCount === 'number'
              ? response.meta.pendingCount
              : payload.filter((row) => row.status === 'pending').length,
          approvedThisWeek: response?.meta?.approvedThisWeek ?? 0,
          approvalRate: response?.meta?.approvalRate ?? 0,
          receiptsCount:
            typeof response?.meta?.receiptsCount === 'number'
              ? response.meta.receiptsCount
              : payload.filter((row) => row.proofUrl).length,
        });
      } catch (err) {
        setError(err.message || 'Unable to load enrollment requests.');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    fetchRequests(true);
  }, [fetchRequests]);

  React.useEffect(() => {
    let canceled = false;

    async function loadOptions() {
      setOptionsLoading(true);
      setOptionsError('');
      const params = new URLSearchParams();
      if (BUSINESS_NAME) {
        params.set('businessName', BUSINESS_NAME);
      }
      const baseQuery = params.toString();
      try {
        const [usersResponse, coursesResponse] = await Promise.all([
          apiFetch(`/api/users${baseQuery ? `?${baseQuery}` : ''}`),
          apiFetch(`/api/courses${baseQuery ? `?${baseQuery}&status=active` : '?status=active'}`),
        ]);

        if (canceled) {
          return;
        }

        const userData = Array.isArray(usersResponse?.data)
          ? usersResponse.data
          : Array.isArray(usersResponse)
          ? usersResponse
          : [];
        const courseData = Array.isArray(coursesResponse?.data)
          ? coursesResponse.data
          : Array.isArray(coursesResponse)
          ? coursesResponse
          : [];

        setLearners(userData);
        setCourses(courseData);
      } catch (error) {
        if (!canceled) {
          setOptionsError(error.message || 'Unable to load learners and courses.');
        }
      } finally {
        if (!canceled) {
          setOptionsLoading(false);
        }
      }
    }

    loadOptions();

    return () => {
      canceled = true;
    };
  }, []);

  const reviewedEnrollment = reviewedId
    ? requests.find((row) => Number(row.id) === Number(reviewedId))
    : undefined;

  React.useEffect(() => {
    if (!reviewedEnrollment) {
      setReviewDecision('approved');
      setReviewNotes('');
      setReviewError('');
      return;
    }
    setReviewDecision(reviewedEnrollment.status || 'pending');
    setReviewNotes(reviewedEnrollment.reviewNotes || '');
    setReviewError('');
  }, [reviewedEnrollment]);

  const resetGrantForm = React.useCallback(() => {
    setSelectedLearnerId('');
    setSelectedCourseId('');
    setGrantMethod('campus');
    setGrantTransactionId(`ADMIN-${Date.now()}`);
    setGrantNotes('');
    setGrantError('');
    setGrantSuccess('');
    setGrantSubmitting(false);
  }, []);

  const selectedLearner = React.useMemo(
    () => learners.find((user) => String(user.id) === String(selectedLearnerId)),
    [learners, selectedLearnerId],
  );

  const selectedCourse = React.useMemo(
    () => courses.find((course) => String(course.id) === String(selectedCourseId)),
    [courses, selectedCourseId],
  );

  const pending = requests.filter((row) => row.status === 'pending');
  const pendingCount = metrics.pendingCount ?? pending.length;

  const handleRefresh = () => {
    fetchRequests(false);
  };

  const openReview = React.useCallback((rowId, decision = null) => {
    setReviewedId(rowId);
    if (decision) {
      setReviewDecision(decision);
    }
  }, []);

  const tableColumns = React.useMemo(
    () => [
      {
        header: 'Learner',
        accessorKey: 'learnerName',
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{row.original.learnerName}</p>
            <p className="text-xs text-muted-foreground">{row.original.learnerEmail}</p>
          </div>
        ),
      },
      {
        header: 'Course',
        accessorKey: 'courseTitle',
      },
      {
        header: 'Method',
        accessorKey: 'paymentMethod',
        cell: ({ row }) => PAYMENT_LABELS[row.original.paymentMethod] || row.original.paymentMethod,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: 'Submitted',
        accessorKey: 'submittedAt',
        cell: ({ row }) => {
          if (!row.original.submittedAt) {
            return '--';
          }
          try {
            return new Date(row.original.submittedAt).toLocaleString();
          } catch {
            return row.original.submittedAt;
          }
        },
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => openReview(row.original.id)}
            className="text-primary"
          >
            Review
          </Button>
        ),
      },
    ],
    [openReview],
  );

  const handleReviewSubmit = async () => {
    if (!reviewedEnrollment) {
      return;
    }
    if (reviewDecision === 'rejected' && !reviewNotes.trim()) {
      setReviewError('Add a reason when rejecting a payment proof.');
      return;
    }

    setReviewError('');
    setReviewSubmitting(true);

    try {
      const body = {
        status: reviewDecision,
        reviewNotes: reviewNotes.trim(),
        reviewerName,
      };
      if (reviewerId) {
        body.reviewerId = reviewerId;
      }
      if (BUSINESS_NAME) {
        body.businessName = BUSINESS_NAME;
      }
      await apiFetch(`/api/enrollments/manual/${reviewedEnrollment.id}/review`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      setReviewedId(null);
      fetchRequests(false);
    } catch (err) {
      setReviewError(err.message || 'Unable to update enrollment.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const proofImage = reviewedEnrollment?.proofUrl
    ? buildAssetUrl(reviewedEnrollment.proofUrl)
    : null;
  const decisionMeta = REVIEW_DECISION_META[reviewDecision] || REVIEW_DECISION_META.pending;

  const handleGrantSubmit = async (event) => {
    event.preventDefault();
    if (!selectedLearner || !selectedCourse) {
      setGrantError('Select both a learner and a course.');
      return;
    }

    setGrantError('');
    setGrantSuccess('');
    setGrantSubmitting(true);

    try {
      const payload = {
        businessName: BUSINESS_NAME,
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        coursePrice: typeof selectedCourse.price === 'number' ? selectedCourse.price : undefined,
        currency: selectedCourse.currency || 'MMK',
        amountLabel: formatPriceLabel(selectedCourse.price),
        paymentMethod: grantMethod,
        transactionReference: grantTransactionId || `ADMIN-${Date.now()}`,
        notes: grantNotes || undefined,
        learnerName: selectedLearner.name,
        learnerEmail: selectedLearner.email,
        userId: selectedLearner.id,
        reviewerName,
        reviewerId,
        reviewNotes: grantNotes || undefined,
      };

      await apiFetch('/api/enrollments/manual/grants', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setGrantSuccess('Enrollment created and approved.');
      fetchRequests(false);
      setTimeout(() => {
        setGrantDialogOpen(false);
        resetGrantForm();
      }, 700);
    } catch (error) {
      setGrantError(error.message || 'Unable to create enrollment.');
    } finally {
      setGrantSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manual enrollments"
        description="Review payment proofs, approve enrollments and monitor learner progress."
      />

      <div className="flex flex-wrap items-center justify-end gap-3">
        {optionsError ? (
          <p className="text-sm text-destructive">{optionsError}</p>
        ) : null}
        <Button
          size="sm"
          onClick={() => {
            setGrantDialogOpen(true);
            setGrantSuccess('');
            setGrantError('');
          }}
          disabled={optionsLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create enrollment
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{pendingCount}</div>
            <p className="text-sm text-muted-foreground">Manual receipts awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved this week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{metrics.approvedThisWeek ?? 0}</div>
            <p className="text-sm text-muted-foreground">Learners granted access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Approval rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{metrics.approvalRate ?? 0}%</div>
            <p className="text-sm text-muted-foreground">Across manual submissions</p>
          </CardContent>
        </Card>
        <Card
          role="button"
          tabIndex="0"
          onClick={() => quickActionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              quickActionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="cursor-pointer transition hover:border-primary"
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Receipts on file</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{metrics.receiptsCount ?? 0}</div>
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
          <div className="flex items-center gap-3">
            {pending.length > 0 ? <Badge variant="secondary">{pending.length} pending</Badge> : null}
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing || loading}>
              {isRefreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </header>
        {loading ? (
          <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading enrollment requests...
          </div>
        ) : (
          <DataTable columns={tableColumns} data={requests} searchPlaceholder="Search enrollment" />
        )}
      </div>

      <div ref={quickActionsRef} className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">Quick actions</h3>
          {pending.length ? <p className="text-xs text-muted-foreground">{pending.length} awaiting manual review</p> : null}
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {pending.length > 0 ? (
            pending.map((row) => (
              <div key={row.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-semibold">{row.learnerName}</p>
                  <p className="text-xs text-muted-foreground">{row.courseTitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      openReview(row.id);
                      quickActionsRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    aria-label="Review proof"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      openReview(row.id, 'approved');
                    }}
                    aria-label="Approve"
                  >
                    <Check className="h-4 w-4 text-emerald-600" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      openReview(row.id, 'rejected');
                    }}
                    aria-label="Reject"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Nothing waiting for manual review.
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={grantDialogOpen}
        onOpenChange={(open) => {
          setGrantDialogOpen(open);
          if (!open) {
            resetGrantForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create enrollment</DialogTitle>
            <DialogDescription>
              Grant course access without requiring a payment screenshot.
            </DialogDescription>
          </DialogHeader>
          {optionsLoading ? (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading learners and courses...
            </div>
          ) : learners.length === 0 || courses.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              Add at least one learner and course before creating manual enrollments.
            </p>
          ) : (
            <form className="space-y-4" onSubmit={handleGrantSubmit}>
              <div className="space-y-2">
                <Label htmlFor="grant-learner">Learner</Label>
                <Select
                  value={selectedLearnerId}
                  onValueChange={(value) => {
                    setSelectedLearnerId(value);
                    setGrantError('');
                  }}
                >
                  <SelectTrigger id="grant-learner">
                    <SelectValue placeholder="Select learner" />
                  </SelectTrigger>
                  <SelectContent>
                    {learners.map((learner) => (
                      <SelectItem key={learner.id} value={String(learner.id)}>
                        {learner.name} ({learner.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grant-course">Course</Label>
                <Select
                  value={selectedCourseId}
                  onValueChange={(value) => {
                    setSelectedCourseId(value);
                    setGrantError('');
                  }}
                >
                  <SelectTrigger id="grant-course">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        {course.title} ({formatPriceLabel(course.price)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grant-method">Method</Label>
                <Select value={grantMethod} onValueChange={setGrantMethod}>
                  <SelectTrigger id="grant-method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {MANUAL_GRANT_METHODS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grant-reference">Reference ID</Label>
                <Input
                  id="grant-reference"
                  value={grantTransactionId}
                  onChange={(event) => setGrantTransactionId(event.target.value)}
                  placeholder="ADMIN-GRANT-123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grant-notes">Admin notes (optional)</Label>
                <Textarea
                  id="grant-notes"
                  rows={3}
                  value={grantNotes}
                  onChange={(event) => setGrantNotes(event.target.value)}
                  placeholder="Share context for the learner or internal team."
                />
              </div>
              {selectedLearner && selectedCourse ? (
                <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">{selectedLearner.name}</span> will gain access to{' '}
                    <span className="font-medium text-foreground">{selectedCourse.title}</span> immediately.
                  </p>
                </div>
              ) : null}
              {grantError ? <p className="text-sm text-destructive">{grantError}</p> : null}
              {grantSuccess ? <p className="text-sm text-emerald-600">{grantSuccess}</p> : null}
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" type="button" onClick={() => setGrantDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={grantSubmitting}>
                  {grantSubmitting ? 'Granting...' : 'Create enrollment'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(reviewedEnrollment)} onOpenChange={(isOpen) => !isOpen && setReviewedId(null)}>
        <DialogContent className="max-w-2xl">
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
                  Submitted {reviewedEnrollment.submittedAt ? new Date(reviewedEnrollment.submittedAt).toLocaleString() : '--'}
                </p>
              </div>
              <div className="grid gap-2 text-sm">
                <p>
                  <span className="font-medium text-muted-foreground">Payment method:</span>{' '}
                  {PAYMENT_LABELS[reviewedEnrollment.paymentMethod] || reviewedEnrollment.paymentMethod}
                </p>
                <p>
                  <span className="font-medium text-muted-foreground">Reference:</span>{' '}
                  {reviewedEnrollment.transactionReference || '--'}
                </p>
                <p>
                  <span className="font-medium text-muted-foreground">Notes:</span>{' '}
                  {reviewedEnrollment.notes || '--'}
                </p>
              </div>
              {proofImage ? (
                <div className="space-y-2">
                  <img
                    src={proofImage}
                    alt="Payment proof"
                    className="h-auto w-full rounded-md border object-cover"
                  />
                  <Button variant="outline" size="sm" asChild>
                    <a href={proofImage} target="_blank" rel="noreferrer">
                      Open original
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-md border border-dashed p-12 text-sm text-muted-foreground">
                  No screenshot uploaded
                </div>
              )}
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Review decision</p>
                    <p className="text-xs text-muted-foreground">{decisionMeta.helper}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs uppercase tracking-wide text-muted-foreground">
                    <div className="flex flex-col items-center gap-1">
                      <span>Current</span>
                      <StatusBadge status={reviewedEnrollment.status} />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span>Selected</span>
                      <StatusBadge status={reviewDecision} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'approved', 'rejected'].map((status) => (
                    <Button
                      key={status}
                      type="button"
                      variant={
                        reviewDecision === status
                          ? status === 'rejected'
                            ? 'destructive'
                            : 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() => {
                        setReviewDecision(status);
                        setReviewError('');
                      }}
                    >
                      {REVIEW_DECISION_META[status].label}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Textarea
                    rows={3}
                    placeholder={decisionMeta.placeholder}
                    value={reviewNotes}
                    onChange={(event) => setReviewNotes(event.target.value)}
                  />
                  {reviewError ? (
                    <p className="text-sm text-destructive">{reviewError}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">{decisionMeta.noteHelper}</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setReviewedId(null)}>
              Close
            </Button>
            <Button onClick={handleReviewSubmit} disabled={reviewSubmitting}>
              {reviewSubmitting ? 'Saving...' : 'Update status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
