import * as React from 'react';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { assessments, submissions, courses, users } from '@/data/mock-data';

const submissionRows = submissions.map((submission) => {
  const assessment = assessments.find((item) => item.id === submission.assessmentId);
  const learner = users.find((user) => user.id === submission.userId);
  return {
    id: submission.id,
    learner: learner?.name ?? 'Unknown learner',
    assessment: assessment?.title ?? 'Assessment',
    score: submission.score,
    status: submission.status,
    submittedAt: submission.submittedAt,
  };
});

const submissionColumns = [
  {
    header: 'Learner',
    accessorKey: 'learner',
  },
  {
    header: 'Assessment',
    accessorKey: 'assessment',
  },
  {
    header: 'Score',
    accessorKey: 'score',
    cell: ({ row }) => `${row.original.score}%`,
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    header: 'Submitted',
    accessorKey: 'submittedAt',
    cell: ({ row }) => new Date(row.original.submittedAt).toLocaleString(),
  },
];

const blueprintSchema = z.object({
  title: z.string().min(3, 'Title required'),
  courseId: z.string().min(1, 'Select a course'),
  questionCount: z.coerce.number().min(1, 'Add at least one question'),
  passScore: z.coerce.number().min(1).max(100),
  notes: z.string().optional(),
});

const defaultValues = {
  title: '',
  courseId: courses[0]?.id ?? '',
  questionCount: 10,
  passScore: 70,
  notes: '',
};

const totalAttempts = submissions.length;
const passCount = submissions.filter((submission) => submission.status === 'passed').length;

export default function AssessmentsPage() {
  const [open, setOpen] = React.useState(false);
  const form = useForm({
    resolver: zodResolver(blueprintSchema),
    defaultValues,
  });

  const onSubmit = (values) => {
    console.log('Create assessment', values);
    setOpen(false);
    form.reset(defaultValues);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments"
        description="Launch blueprints, track submissions and manage evaluation workflows."
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New blueprint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create assessment blueprint</DialogTitle>
              <DialogDescription>Set up attempt limits, pass criteria and notes for evaluators.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessment title</FormLabel>
                      <FormControl>
                        <Input placeholder="Final project review" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="courseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Linked course</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select course" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="questionCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Questions</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="passScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing score (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evaluator notes</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="Outline rubric, manual grading steps, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">
                    Create assessment
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Assessments live</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{assessments.length}</div>
            <CardDescription>Blueprints ready for learners</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalAttempts}</div>
            <CardDescription>Tracked attempts across courses</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Pass rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{Math.round((passCount / Math.max(totalAttempts, 1)) * 100)}%</div>
            <CardDescription>Passed versus total attempts</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Requires grading</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {submissions.filter((submission) => submission.status === 'pending').length}
            </div>
            <CardDescription>Await manual review</CardDescription>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Blueprints</CardTitle>
          <CardDescription>Assessments per course with attempt limits.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {assessments.map((assessment) => {
            const course = courses.find((item) => item.id === assessment.courseId);
            const attempts = submissions.filter((submission) => submission.assessmentId === assessment.id);
            const passResults = attempts.filter((submission) => submission.status === 'passed').length;
            return (
              <div key={assessment.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{assessment.title}</p>
                    <p className="text-xs text-muted-foreground">{course?.title}</p>
                  </div>
                  <Badge variant="secondary">{attempts.length} attempts</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {assessment.questionCount} questions – Pass {assessment.passScore}% – {assessment.attempts} attempts allowed
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {passResults} passed – Last edit {new Date(assessment.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>Monitor assessment completions and outstanding reviews.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={submissionColumns} data={submissionRows} searchPlaceholder="Search submissions" />
        </CardContent>
      </Card>
    </div>
  );
}
