import * as React from 'react';
import { Mail, Phone, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { contactPageBlocks } from '@/data/mock-data';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  topic: z.string().min(2, 'Select a topic'),
  message: z.string().min(10, 'Message should be at least 10 characters'),
});

const defaultValues = {
  name: '',
  email: '',
  topic: 'Support',
  message: '',
};

export default function ContactUsPage() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = (values) => {
    console.log('Contact request', values);
    form.reset(defaultValues);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 lg:flex-row">
      <div className="space-y-6 lg:w-1/2">
        <h1 className="text-4xl font-bold tracking-tight">We’re here to help</h1>
        <p className="text-muted-foreground">
          Whether you’re picking the right cohort or need support during your journey, our team is ready to answer.
        </p>
        <div className="space-y-4">
          {contactPageBlocks.map((block) => (
            <Card key={block.id}>
              <CardHeader className="flex items-start justify-between">
                <div>
                  <CardTitle>{block.title}</CardTitle>
                  <CardDescription>Updated {new Date(block.updatedAt).toLocaleDateString()}</CardDescription>
                </div>
                {block.title === 'Support' ? <Mail className="h-5 w-5 text-primary" /> : <Phone className="h-5 w-5 text-primary" />}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{block.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Send us a message</CardTitle>
          <CardDescription>We respond within one business day.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your name</FormLabel>
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="Support" {...field} />
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
                      <Textarea rows={5} placeholder="Share details about your request." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <Send className="mr-2 h-4 w-4" /> Send message
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
