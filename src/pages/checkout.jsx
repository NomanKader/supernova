import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useParams, useNavigate } from 'react-router-dom';

import { useAuth } from '@/components/marketing/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { courses } from '@/data/mock-data';

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
  const { isAuthenticated, recordPurchase } = useAuth();
  const navigate = useNavigate();
  const course = courses.find((item) => item.id === courseId);

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
  const [copyState, setCopyState] = React.useState('');
  const proofValue = form.watch('proof');
  const proofFile =
    proofValue instanceof FileList
      ? proofValue[0]
      : Array.isArray(proofValue) && proofValue.length
        ? proofValue[0]
        : undefined;
  const [previewUrl, setPreviewUrl] = React.useState('');

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const onSubmit = (values) => {
    console.log('Payment submission', {
      courseId,
      method: values.method,
      transactionId: values.transactionId,
      notes: values.notes,
    });
    recordPurchase(course.id);
    setStatus('Payment submitted! Access has been unlocked.');
    setTimeout(() => navigate(`/courses/${course.id}`), 1200);
  };

  const selectedMethod = form.watch('method');

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
            You are unlocking <strong>{course.title}</strong> for MMK 149,000. Choose your preferred method and upload the receipt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
            <p>Course: {course.title}</p>
            <p>Total amount: MMK 149,000</p>
          </div>
          {status ? <p className="text-sm font-medium text-primary">{status}</p> : null}
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
