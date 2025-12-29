import * as React from 'react';
import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/marketing/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/config/api';

const contactMethods = [
  {
    id: 'email',
    title: 'Email Us',
    value: 'support@edusupernova.com',
    description: "Send us an email and we'll respond within 24 hours.",
    icon: Mail,
    href: 'mailto:support@edusupernova.com',
  },
  {
    id: 'call',
    title: 'Call Us',
    value: '+959969119949',
    description: 'Monday to Friday, 9 AM to 6 PM MMT.',
    icon: Phone,
    href: 'tel:+959969119949',
  },
  {
    id: 'visit',
    title: 'Visit Us',
    value: 'No.34, Bogalazay Street, Botahtaung Township, Yangon',
    description: 'Our headquarters and main campus.',
    icon: MapPin,
  },
  {
    id: 'chat',
    title: 'Live Chat',
    value: 'Available 24/7',
    description: 'Get instant help from our support team.',
    icon: MessageCircle,
  },
];

const faqItems = [
  {
    question: 'How do I enroll in a course?',
    answer:
      'Browse our course catalog, select the course you want, and click "Enroll Now." You can pay securely online and start learning immediately.',
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer:
      "Yes! We offer a 30-day money-back guarantee. If you're not completely satisfied with your course, contact us for a full refund.",
  },
  {
    question: 'Do I get a certificate upon completion?',
    answer:
      "Absolutely! After successfully completing any course, you'll receive a verified certificate you can share on LinkedIn and add to your resume.",
  },
  {
    question: 'Can I access courses on mobile devices?',
    answer:
      'Yes, our learning platform is fully optimized for mobile. Access course materials, videos, and assignments from any device, anywhere.',
  },
  {
    question: 'Is there student support available?',
    answer:
      'We provide comprehensive support including instructor Q&A, community forums, and a dedicated student success team available 24/7.',
  },
];

const contactSubjects = [
  { value: 'support', label: 'General Support' },
  { value: 'billing', label: 'Billing & Payments' },
  { value: 'courses', label: 'Course Enrollment' },
  { value: 'technical', label: 'Technical Assistance' },
  { value: 'partnerships', label: 'Partnership Opportunities' },
];

const schema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  subject: z.string().min(2, 'Select a subject'),
  message: z.string().min(10, 'Message should be at least 10 characters'),
});

const defaultValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export default function ContactUsPage() {
  const { isAuthenticated, user } = useAuth();
  const hideFaq =
    isAuthenticated && typeof user?.email === 'string'
      ? user.email.toLowerCase() === 'dev.pyaephyoswe@gmail.com'
      : false;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const [submissionStatus, setSubmissionStatus] = React.useState({
    state: 'idle',
    message: '',
  });

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const onSubmit = async (values) => {
    setSubmissionStatus({ state: 'loading', message: '' });
    try {
      const subjectLabel =
        contactSubjects.find((option) => option.value === values.subject)?.label || values.subject;
      const payload = {
        ...values,
        subject: subjectLabel,
      };
      await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setSubmissionStatus({
        state: 'success',
        message: "Thanks for reaching out! We'll follow up shortly.",
      });
      form.reset(defaultValues);
    } catch (error) {
      setSubmissionStatus({
        state: 'error',
        message: error.message || 'Unable to send your message. Please try again.',
      });
    }
  };
  const isSubmitting = submissionStatus.state === 'loading';

  return (
    <div className="flex flex-col">
      <section
        className="relative flex min-h-[280px] items-center justify-center overflow-hidden text-white"
        style={{
          backgroundImage: 'linear-gradient(90deg, #1c6dff 0%, #2155ff 50%, #1a3dff 100%)',
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-20 text-center md:py-24">
          <div className="mx-auto max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Get in Touch</h1>
            <p className="text-lg text-white/80">
              Have questions about our courses or need support? We&apos;re here to help you succeed in your learning
              journey.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4">
          <br/>
          <div className="-mt-14 grid gap-6 pb-8 md:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map(({ id, title, value, description, icon: Icon, href }) => (
              <Card
                key={id}
                className="border-0 bg-white text-slate-900 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <CardHeader className="space-y-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription className="text-sm text-slate-500">{description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {href ? (
                    <a href={href} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-slate-700">{value}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="py-16">
            {/* <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>Fill out the form and we&apos;ll reply as soon as possible.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Avery Johnson" {...field} />
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
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@gmail.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {contactSubjects.map(({ value, label }) => (
                                <SelectItem key={value} value={value}>
                                  {label}
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
                      name="message"
                      render={({ field }) => {
                        const characterCount = field.value?.length ?? 0;
                        return (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={5}
                                maxLength={500}
                                placeholder="Tell us how we can help you..."
                                {...field}
                              />
                            </FormControl>
                            <div className="text-right text-xs text-muted-foreground">{`${characterCount}/500 characters`}</div>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <div className="space-y-3">
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        <Send className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                      {submissionStatus.message ? (
                        <p
                          className={`text-center text-sm ${
                            submissionStatus.state === 'success'
                              ? 'text-green-600'
                              : 'text-destructive'
                          }`}
                          aria-live="polite"
                        >
                          {submissionStatus.message}
                        </p>
                      ) : null}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card> */}

            <Card className="flex flex-col overflow-hidden shadow-lg">
              <div className="h-64 w-full">
                <iframe
                  title="Supernova HQ"
                  src="https://maps.app.goo.gl/BNJm77rY7ZV3hcUD6"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <CardHeader>
                <CardTitle>Find Us</CardTitle>
                <CardDescription>Plan a visit or schedule a campus tour.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-slate-700">Office Hours</p>
                  <ul className="mt-2 space-y-1">
                    <li className="flex justify-between text-slate-600">
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 6:00 PM</span>
                    </li>
                    <li className="flex justify-between text-slate-600">
                      <span>Saturday</span>
                      <span>10:00 AM - 4:00 PM</span>
                    </li>
                    <li className="flex justify-between text-slate-600">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Campus Address</p>
                  <p>No.34, Bogalazay Street, Botahtaung Township, Yangon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {hideFaq ? null : (
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight">Frequently Asked Questions</h2>
              <p className="mt-3 text-base text-muted-foreground">
                Quick answers to common questions about our platform and courses.
              </p>
            </div>
            <div className="mt-12 space-y-4">
              {faqItems.map(({ question, answer }) => (
                <Card
                  key={question}
                  className="border border-slate-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-lg">{question}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-slate-600">{answer}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
