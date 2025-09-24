import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { courses, users } from '@/data/mock-data';

const schema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  motivation: z.string().min(10, 'Share a brief motivation'),
  referral: z.string().optional(),
});

const defaultValues = {
  fullName: '',
  email: '',
  motivation: '',
  referral: '',
};

export default function EnrollPage() {
  const { courseId } = useParams();
  const course = courses.find((item) => item.id === courseId);
  const leadMentor = users.find((user) => course?.instructorIds?.includes(user.id));

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = (values) => {
    console.log('Enroll request', { courseId, ...values });
    form.reset(defaultValues);
  };

  if (!course) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center">
        <CheckCircle2 className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-semibold">Course not found</h1>
        <p className="text-muted-foreground">The program you are looking for may have moved or closed enrollment.</p>
        <Button asChild>
          <Link to="/catalog">Browse catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12 lg:flex-row">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Reserve your seat</CardTitle>
          <CardDescription>
            Secure a spot in <strong>{course.title}</strong>. A mentor will reach out within 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jordan Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@supernova.dev" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="motivation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What do you hope to accomplish?</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="Share your goals so we can tailor support." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="referral"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referral code (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="REF-2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Submit enrollment request
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="space-y-6 lg:w-1/2">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>{course.title}</CardTitle>
            <CardDescription>{course.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{course.lessons} lessons · {course.level} level</span>
            </div>
            <p>
              Meet your lead mentor <strong>{leadMentor?.name ?? 'TBA'}</strong> and collaborate with {course.enrollments} alumni across previous cohorts.
            </p>
            <p>
              Every participant graduates with a capstone project, certificate, and alumni network to keep momentum.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. A mentor will schedule a quick fit call to learn about your goals.</p>
            <p>2. Receive onboarding materials and learning portal access.</p>
            <p>3. Join the next standup and meet your accountability pod.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
