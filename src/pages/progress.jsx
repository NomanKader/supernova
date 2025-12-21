import * as React from 'react';
import { Activity, Gauge, Target } from 'lucide-react';

import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { enrollments, courses, users } from '@/data/mock-data';

const rows = enrollments.map((enrollment) => {
  const learner = users.find((user) => user.id === enrollment.userId);
  const course = courses.find((item) => item.id === enrollment.courseId);
  const lastUpdated = enrollment.updatedAt ?? enrollment.enrolledAt;
  const status = enrollment.progress >= 100 ? 'completed' : enrollment.progress >= 50 ? 'in-progress' : 'not-started';
  return {
    id: enrollment.id,
    learner: learner?.name ?? 'Unknown learner',
    course: course?.title ?? 'Unknown course',
    status,
    progress: enrollment.progress,
    lastUpdated,
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
    header: 'Progress',
    accessorKey: 'progress',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <ProgressBar value={row.original.progress} className="h-2 w-32" />
        <span className="text-sm text-muted-foreground">{row.original.progress}%</span>
      </div>
    ),
  },
  {
    header: 'Updated',
    accessorKey: 'lastUpdated',
    cell: ({ row }) => new Date(row.original.lastUpdated).toLocaleDateString(),
  },
];

const completionByCourse = courses.map((course) => {
  const related = rows.filter((row) => row.course === course.title);
  const completed = related.filter((row) => row.progress >= 100).length;
  const learners = related.length;
  const completion = learners ? Math.round((completed / learners) * 100) : 0;
  return {
    course: course.title,
    completion,
    learners,
  };
});

const averageProgress = rows.reduce((acc, row) => acc + row.progress, 0) / Math.max(rows.length, 1);
const completionRate = rows.filter((row) => row.progress >= 100).length / Math.max(rows.length, 1);

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Course progress"
        description="Track learner completion and identify interventions at risk of churn."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average completion</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{averageProgress.toFixed(0)}%</div>
            <CardDescription>Across all tracked manual enrollments</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed learners</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{Math.round(completionRate * 100)}%</div>
            <CardDescription>
              {rows.filter((row) => row.progress >= 100).length} learners completed their course
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active courses</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{completionByCourse.filter((item) => item.learners > 0).length}</div>
            <CardDescription>Courses with at least one tracked learner</CardDescription>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Learner progress detail</CardTitle>
          <CardDescription>Filter by learner name or course to spot exceptions.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={rows} searchPlaceholder="Search learners" />
        </CardContent>
      </Card>
    </div>
  );
}
