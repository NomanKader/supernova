import * as React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

import { apiFetch } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

export default function AccountVerifyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = React.useState(token ? 'loading' : 'missing');
  const [error, setError] = React.useState(null);
  const [userInfo, setUserInfo] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  React.useEffect(() => {
    const fetchInvite = async () => {
      if (!token) {
        setStatus('missing');
        return;
      }

      setStatus('loading');
      setError(null);

      try {
        const response = await apiFetch(`/api/users/invites/${token}`);
        setUserInfo(response?.data?.user || null);
        setStatus('ready');
      } catch (err) {
        setError(err.message || 'Verification link is not valid.');
        setStatus('invalid');
      }
    };

    fetchInvite();
  }, [token]);

  const onSubmit = async (values) => {
    if (!token) {
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await apiFetch('/api/users/invites/accept', {
        method: 'POST',
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });
      setSubmitted(true);
      setStatus('completed');
    } catch (err) {
      setError(err.message || 'Failed to verify your account.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    if (status === 'missing') {
      return (
        <div className="space-y-4 text-center text-sm text-muted-foreground">
          <p>Verification token missing. Please open the link from your email.</p>
        </div>
      );
    }

    if (status === 'loading') {
      return (
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          Verifying invitation&hellip;
        </div>
      );
    }

    if (status === 'invalid') {
      return (
        <div className="space-y-4 text-center text-sm text-destructive">
          <p>{error || 'Verification link is no longer valid.'}</p>
          <p>
            Contact your workspace admin to receive a new invitation or{' '}
            <Link to="/contact-us" className="underline">
              reach out to support
            </Link>
            .
          </p>
        </div>
      );
    }

    if (status === 'completed' && submitted) {
      return (
        <div className="space-y-4 text-center text-sm text-muted-foreground">
          <p>Your account is verified. You can now sign in using the email we invited.</p>
          <div>
            <Button asChild>
              <Link to="/login">Go to login</Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Setting password for</p>
            <p className="font-medium text-foreground">{userInfo?.email}</p>
            {userInfo?.businessName ? (
              <p className="text-xs text-muted-foreground">
                Workspace: <span className="font-medium">{userInfo.businessName}</span>
              </p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter a strong password"
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition hover:text-foreground"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify account'}
          </Button>
        </form>
      </Form>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#f3f6ff] px-4 py-16">
      <Card className="w-full max-w-md border border-slate-200 shadow-lg shadow-blue-100/30">
        <CardHeader className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">Verify your account</h1>
            <p className="text-sm text-slate-500">
              {status === 'completed'
                ? 'Verification successful.'
                : 'Create a password to activate your Supernova access.'}
            </p>
          </div>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
          Need help?{' '}
          <Link to="/contact-us" className="ml-1 underline">
            Contact support
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
