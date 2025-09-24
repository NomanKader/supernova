import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/components/marketing/auth-context';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const schema = z.object({
  email: z.string().email('Provide a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  subscribeNow: z.boolean().default(false),
});

const defaultValues = {
  email: '',
  password: '',
  subscribeNow: false,
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isSubscribed } = useAuth();
  const [status, setStatus] = React.useState('');
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  React.useEffect(() => {
    if (isAuthenticated) {
      setStatus(isSubscribed ? 'You are already subscribed.' : 'Welcome back!');
    }
  }, [isAuthenticated, isSubscribed]);

  const onSubmit = (values) => {
    login({ email: values.email, subscribe: values.subscribeNow });
    form.reset(defaultValues);
    setStatus(values.subscribeNow ? 'Subscription activated. Enjoy the full course library!' : 'Logged in successfully.');
    navigate('/courses');
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-16 lg:flex-row lg:items-center">
      <div className="space-y-4 lg:w-1/2">
        <h1 className="text-4xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Continue learning with your cohort, track progress, and access mentor feedback in one place.
        </p>
        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          New to Supernova?{' '}
          <Link to="/register" className="font-medium text-primary">
            Create an account
          </Link>{' '}
          to join upcoming cohorts.
        </div>
        {status ? <p className="text-sm font-medium text-primary">{status}</p> : null}
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Learner sign in</CardTitle>
          <CardDescription>Use the email you registered with. Toggle subscription for instant access.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@supernova.dev" autoComplete="email" {...field} />
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
                      <Input type="password" autoComplete="current-password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subscribeNow"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Subscribe now</FormLabel>
                      <CardDescription>Unlock all videos, resources, and assessments instantly.</CardDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Log in
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
