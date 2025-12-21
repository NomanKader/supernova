import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '@/components/marketing/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch, BUSINESS_NAME } from '@/config/api';
import { formatPriceLabel } from '@/utils/course';

const paymentSchema = z.object({
  method: z.enum(['wave', 'kpay']),
  transactionId: z.string().min(3, 'Enter the transaction reference'),
  notes: z.string().optional(),
  proof: z
    .any()
    .refine((value) => (value instanceof FileList ? value.length > 0 : Boolean(value)), 'Upload payment proof'),
});

const paymentNumbers = {
  wave: '+95 9 123 456 789',
  kpay: '+95 9 987 654 321',
};

export default function CheckoutPage() {
  const { courseId } = useParams();
  const location = useLocation();
  const { isAuthenticated, recordPurchase, user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = React.useState(null);
  const [courseLoading, setCourseLoading] = React.useState(true);
  const [courseError, setCourseError] = React.useState('');

  const form = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: 'wave',
      transactionId: '',
      notes: '',
      proof: undefined,
    },
  });

  const [status, setStatus] = React.useState('');
  const [submitError, setSubmitError] = React.useState('');
  const [copyState, setCopyState] = React.useState('');
  const coursesEndpoint = React.useMemo(() => {
    const params = new URLSearchParams();
    if (BUSINESS_NAME) {
      params.set('businessName', BUSINESS_NAME);
    }
    params.set('status', 'all');
    const query = params.toString();
    return `/api/courses${query ? `?${query}` : ''}`;
  }, []);

  React.useEffect(() => {
    if (!courseId) {
      setCourse(null);
      setCourseError('Missing course identifier.');
      setCourseLoading(false);
      return;
    }

    let isMounted = true;
    setCourseLoading(true);
    setCourseError('');

    async function loadCourse() {
      try {
        const response = await apiFetch(coursesEndpoint);
        const payload = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        const found = payload.find((entry) => String(entry.id) === String(courseId));
        if (!isMounted) {
          return;
        }
        if (found) {
          setCourse(found);
        } else {
          setCourse(null);
          setCourseError('We could not find that course.');
        }
      } catch (error) {
        if (isMounted) {
          setCourse(null);
          setCourseError(error.message || 'Unable to load course details.');
        }
      } finally {
        if (isMounted) {
          setCourseLoading(false);
        }
      }
    }

    loadCourse();
    return () => {
      isMounted = false;
    };
  }, [courseId, coursesEndpoint]);
  const proofValue = form.watch('proof');
  const proofFile =
    proofValue instanceof FileList
      ? proofValue[0]
      : Array.isArray(proofValue) && proofValue.length
        ? proofValue[0]
        : undefined;
  const [previewUrl, setPreviewUrl] = React.useState('');
  const redirectTarget = `${location.pathname}${location.search}${location.hash}`;
  const selectedMethod = form.watch('method');
  const totalAmountLabel = course?.price ? formatPriceLabel(course.price) : 'MMK 149,000';
  const currencyCode = course?.currency || 'MMK';

  React.useEffect(() => {
    setCopyState('');
  }, [selectedMethod]);

  React.useEffect(() => {
    if (!proofFile) {
      setPreviewUrl((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous);
        }
        return '';
      });
      return undefined;
    }
    const objectUrl = URL.createObjectURL(proofFile);
    setPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return objectUrl;
    });
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [proofFile]);

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTarget)}`} replace />;
  }

  if (courseLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Loading checkout details...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Course unavailable</CardTitle>
            <CardDescription>
              {courseError || 'The course you attempted to enroll in may have been unpublished.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/courses">Browse other courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (values) => {
    if (!course) {
      return;
    }
    setSubmitError('');
    setStatus('');

    try {
      const formData = new FormData();
      if (BUSINESS_NAME) {
        formData.append('businessName', BUSINESS_NAME);
      }
      formData.append('courseId', course.id);
      formData.append('courseTitle', course.title);
      if (typeof course.price === 'number') {
        formData.append('coursePrice', String(course.price));
      }
      if (currencyCode) {
        formData.append('currency', currencyCode);
      }
      formData.append('amountLabel', totalAmountLabel);
      formData.append('paymentMethod', values.method);
      formData.append('transactionReference', values.transactionId);
      if (values.notes) {
        formData.append('notes', values.notes);
      }
      const learnerName = user?.name || user?.email || 'Learner';
      const learnerEmail = user?.email || 'learner@supernova.dev';
      formData.append('learnerName', learnerName);
      formData.append('learnerEmail', learnerEmail);
      if (user?.id) {
        formData.append('userId', String(user.id));
      }
      if (proofFile) {
        formData.append('proof', proofFile);
      }

      await apiFetch('/api/enrollments/manual', {
        method: 'POST',
        body: formData,
      });

      recordPurchase(course.id);
      setStatus('Payment proof submitted. Our admissions team will review it shortly.');
      handleClearProof();
      form.reset({
        method: values.method,
        transactionId: '',
        notes: '',
        proof: undefined,
      });
      setTimeout(() => navigate(`/courses/${course.id}`), 1600);
    } catch (error) {
      setSubmitError(error.message || 'Unable to submit payment proof.');
    }
  };

  const handleCopy = async () => {
    const number = paymentNumbers[selectedMethod];
    try {
      await navigator.clipboard.writeText(number);
      setCopyState('Copied!');
      setTimeout(() => setCopyState(''), 1500);
    } catch (error) {
      console.warn('Clipboard copy failed', error);
      setCopyState('Copy failed');
    }
  };

  const handleClearProof = () => {
    form.setValue('proof', undefined);
    setPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return '';
    });
  };

  const renderProofPreview = () => {
    if (!proofFile) {
      return null;
    }

    const formattedSize =
      proofFile.size >= 1024 * 1024
        ? `${(proofFile.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(proofFile.size / 1024)} KB`;

    return (
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">{proofFile.name}</p>
            <p className="text-xs text-muted-foreground">{formattedSize}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={handleClearProof}>
            Remove
          </Button>
        </div>
        {previewUrl ? (
          <div className="relative overflow-hidden rounded-lg border bg-background shadow-sm">
            <img
              src={previewUrl}
              alt="Payment proof preview"
              className="max-h-64 w-full object-cover"
            />
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Admins verify manual payment details against this screenshot before unlocking the course.
        </p>
      </div>
    );
  };

  const phoneHighlight = (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-primary bg-primary/5 px-3 py-2 text-sm">
      <span className="font-medium text-primary">Send to: {paymentNumbers[selectedMethod]}</span>
      <Button variant="ghost" size="sm" onClick={handleCopy}>
        Copy
      </Button>
      {copyState ? <span className="text-xs text-muted-foreground">{copyState}</span> : null}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Confirm payment</CardTitle>
          <CardDescription>
            You are unlocking <strong>{course.title}</strong> for {totalAmountLabel}. Choose your preferred method and upload the receipt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
            <p>Course: {course.title}</p>
            <p>Total amount: {totalAmountLabel}</p>
          </div>
          {status ? <p className="text-sm font-medium text-primary">{status}</p> : null}
          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Payment method</FormLabel>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className={`flex cursor-pointer items-center justify-between rounded-md border p-3 ${field.value === 'wave' ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                        <span>Wave Money</span>
                        <Input type="radio" value="wave" checked={field.value === 'wave'} onChange={() => field.onChange('wave')} className="hidden" />
                      </label>
                      <label className={`flex cursor-pointer items-center justify-between rounded-md border p-3 ${field.value === 'kpay' ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                        <span>KPay</span>
                        <Input type="radio" value="kpay" checked={field.value === 'kpay'} onChange={() => field.onChange('kpay')} className="hidden" />
                      </label>
                    </div>
                    {phoneHighlight}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction reference</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the transaction code" {...field} />
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
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Share details for the admin review" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="proof"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload screenshot</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(event) => field.onChange(event.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                    {renderProofPreview()}
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit payment proof'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
