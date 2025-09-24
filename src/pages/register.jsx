import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/components/marketing/auth-context';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const schema = z.object({
  fullName: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Provide a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  goal: z.string().min(3, 'Tell us what you want to achieve'),
});

const defaultValues = {
  fullName: '',
  email: '',
  password: '',
  goal: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = React.useState('');
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = (values) => {
    console.log('Register learner', values);
    login({ email: values.email, subscribe: false });
    form.reset(defaultValues);
    setStatus('Account created. You are logged in—unlock the full course when you are ready.');
    navigate('/courses');
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12 lg:flex-row">
      <div className="space-y-6 lg:w-1/2">
        <PageHeader
          title="Create your account"
          description="Tell us who you are and we will curate the right cohort for your goals."
        />
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>What you get</CardTitle>
              <CardDescription>Everything you need to stay motivated and finish strong.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Personalized onboarding call with a mentor</p>
              <p>• Weekly accountability standups and peer demos</p>
              <p>• Career toolkit: interview prep, capstone feedback, hiring loop</p>
            </CardContent>
          </Card>
          {status ? <p className="text-sm font-medium text-primary">{status}</p> : null}
        </div>
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Get started free</CardTitle>
          <CardDescription>No credit card required. Cancel anytime.</CardDescription>
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
                      <Input placeholder="Jamie Rivera" {...field} />
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Minimum 8 characters" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learning goal</FormLabel>
                    <FormControl>
                      <Input placeholder="Ship a production-ready React app" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Create account
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
