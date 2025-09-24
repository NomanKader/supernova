import * as React from 'react';
import { Inbox, MessageCircleMore, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { contactPageBlocks } from '@/data/mock-data';

const inquirySchema = z.object({
  category: z.enum(['support', 'sales', 'partnerships']),
  email: z.string().email('Provide a valid email'),
  message: z.string().min(10, 'Message should be at least 10 characters'),
});

const channelIcons = {
  Support: <Inbox className="h-4 w-4" />,
  Sales: <Phone className="h-4 w-4" />,
  Partnerships: <MessageCircleMore className="h-4 w-4" />,
};

const defaultValues = {
  category: 'support',
  email: '',
  message: '',
};

export default function ContactPage() {
  const form = useForm({
    resolver: zodResolver(inquirySchema),
    defaultValues,
  });

  const onSubmit = (values) => {
    console.log('Route inquiry', values);
    form.reset(defaultValues);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact center"
        description="Manage inbound messages and update the channels available to learners."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {contactPageBlocks.map((block) => {
          const icon = channelIcons[block.title] ?? <Inbox className="h-4 w-4" />;
          return (
            <Card key={block.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{block.title}</CardTitle>
                  <CardDescription>Last updated {new Date(block.updatedAt).toLocaleDateString()}</CardDescription>
                </div>
                {icon}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{block.content}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Route incoming inquiry</CardTitle>
          <CardDescription>Simulate assignment of a learner message to the right team.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="partnerships">Partnerships</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reply-to email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="learner@domain.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="How can we help?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Log inquiry</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
