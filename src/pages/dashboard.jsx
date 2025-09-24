import * as React from 'react';
import { TrendingUp, Users as UsersIcon, GraduationCap, FileCheck2 } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { DataTable } from '@/components/data-table';
import { StatsCard } from '@/components/dashboard/stats-card';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { users, courses, enrollments, certificateRequests, promotions } from '@/data/mock-data';

const enrollmentSeries = [
  { month: 'Apr', approved: 32, pending: 4 },
  { month: 'May', approved: 40, pending: 8 },
  { month: 'Jun', approved: 36, pending: 6 },
  { month: 'Jul', approved: 44, pending: 5 },
  { month: 'Aug', approved: 52, pending: 7 },
  { month: 'Sep', approved: 38, pending: 9 },
];

const pendingCertificates = certificateRequests.filter((cert) => cert.status === 'awaiting-review');
const pendingEnrollments = enrollments.filter((enr) => enr.paymentStatus === 'pending');
const activeCourses = courses.filter((course) => course.status === 'published');
const totalLearners = users.filter((user) => user.role === 'student').length;

const pendingColumns = [
  {
    header: 'Learner',
    accessorKey: 'learner',
    cell: ({ row }) => <span className="font-medium">{row.original.learner}</span>,
  },
  {
    header: 'Course',
    accessorKey: 'course',
  },
  {
    header: 'Submitted',
    accessorKey: 'submitted',
  },
  {
    header: 'Type',
    accessorKey: 'type',
  },
];

const pendingRows = [
  ...pendingEnrollments.map((enr) => {
    const learner = users.find((user) => user.id === enr.userId);
    const course = courses.find((c) => c.id === enr.courseId);
    return {
      id: `enr-${enr.id}`,
      learner: learner?.name ?? 'Unknown learner',
      course: course?.title ?? 'Unknown course',
      submitted: new Date(enr.enrolledAt).toLocaleDateString(),
      type: 'Manual payment',
    };
  }),
  ...pendingCertificates.map((cert) => {
    const learner = users.find((user) => user.id === cert.userId);
    const course = courses.find((c) => c.id === cert.courseId);
    return {
      id: `cert-${cert.id}`,
      learner: learner?.name ?? 'Unknown learner',
      course: course?.title ?? 'Unknown course',
      submitted: new Date(cert.requestedAt).toLocaleDateString(),
      type: 'Certificate review',
    };
  }),
];

const coachLeaderboard = users
  .filter((user) => user.role === 'instructor')
  .map((instructor) => {
    const coachedCourses = courses.filter((course) => course.instructorIds?.includes(instructor.id));
    const learnerCount = enrollments.filter((enrollment) => coachedCourses.some((course) => course.id === enrollment.courseId)).length;
    const pendingReviews = pendingRows.filter((row) => coachedCourses.some((course) => course.title === row.course)).length;

    return {
      id: instructor.id,
      name: instructor.name,
      learnerCount,
      pendingReviews,
    };
  })
  .sort((a, b) => b.learnerCount - a.learnerCount)
  .slice(0, 3);

const promoCadence = promotions.map((promo) => ({
  id: promo.id,
  title: promo.title,
  status: promo.status,
  channel: promo.channel,
  startsAt: new Date(promo.startsAt).toLocaleDateString(),
  endsAt: new Date(promo.endsAt).toLocaleDateString(),
}));

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-md border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-muted-foreground">
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description="Monitor operations across users, courses and manual workflows."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Active learners"
          value={totalLearners.toString()}
          changeLabel="+12% vs last cycle"
          icon={<UsersIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Published courses"
          value={activeCourses.length.toString()}
          changeLabel="2 in review"
          icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Pending reviews"
          value={(pendingEnrollments.length + pendingCertificates.length).toString()}
          changeLabel={`${pendingEnrollments.length} payments, ${pendingCertificates.length} certificates`}
          icon={<FileCheck2 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Live promotions"
          value={promotions.filter((promo) => promo.status === 'live').length.toString()}
          changeLabel="Keep momentum through end of month"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Enrollment velocity</CardTitle>
            <CardDescription>Manual payment approvals against total enrollments</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentSeries}>
                <defs>
                  <linearGradient id="approved" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pending" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" className="stroke-muted" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="approved" stroke="hsl(var(--primary))" fill="url(#approved)" strokeWidth={2} />
                <Area type="monotone" dataKey="pending" stroke="hsl(var(--destructive))" fill="url(#pending)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Coach leaderboard</CardTitle>
            <CardDescription>Mentors supporting the largest cohorts and outstanding reviews.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {coachLeaderboard.map((coach) => (
              <div key={coach.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-foreground">{coach.name}</p>
                  <span className="text-xs text-muted-foreground">{coach.pendingReviews} pending reviews</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{coach.learnerCount} active learners</p>
              </div>
            ))}
            {coachLeaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground">No instructor activity recorded yet.</p>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Items requiring follow-up</CardTitle>
          <CardDescription>Manual payment proofs and certificate requests awaiting action</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={pendingColumns} data={pendingRows} searchPlaceholder="Search learner or course" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Promotion cadence</CardTitle>
          <CardDescription>Track live and upcoming campaigns across channels.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {promoCadence.map((promo) => (
            <div key={promo.id} className="rounded-lg border p-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{promo.title}</p>
                <span className="text-xs uppercase tracking-wide">{promo.status}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{promo.channel} • {promo.startsAt} – {promo.endsAt}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
