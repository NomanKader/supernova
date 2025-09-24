import * as React from 'react';
import { CalendarRange, Megaphone, Plus } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { promotions } from '@/data/mock-data';

const columns = [
  {
    header: 'Campaign',
    accessorKey: 'title',
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    header: 'Channel',
    accessorKey: 'channel',
    cell: ({ row }) => <Badge variant="secondary">{row.original.channel}</Badge>,
  },
  {
    header: 'Range',
    accessorKey: 'startsAt',
    cell: ({ row }) => `${new Date(row.original.startsAt).toLocaleDateString()} – ${new Date(row.original.endsAt).toLocaleDateString()}`,
  },
];

const promoSchema = z.object({
  title: z.string().min(3, 'Title required'),
  channel: z.enum(['email', 'in-app', 'banner', 'social']),
  startsAt: z.string().min(1, 'Select a start date'),
  endsAt: z.string().min(1, 'Select an end date'),
  description: z.string().min(10, 'Add a short description'),
});

const defaultValues = {
  title: '',
  channel: 'email',
  startsAt: new Date().toISOString().slice(0, 10),
  endsAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10),
  description: '',
};

export default function PromotionsPage() {
  const [open, setOpen] = React.useState(false);
  const form = useForm({
    resolver: zodResolver(promoSchema),
    defaultValues,
  });

  const onSubmit = (values) => {
    console.log('Create promotion', values);
    setOpen(false);
    form.reset(defaultValues);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions"
        description="Launch campaigns across channels to drive enrollment and retention."
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New promotion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Promotion campaign</DialogTitle>
              <DialogDescription>Coordinate messaging, channel and timing for marketing efforts.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="September enrollment boost" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select channel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email">Email campaign</SelectItem>
                          <SelectItem value="in-app">In-app notification</SelectItem>
                          <SelectItem value="banner">In-app banner</SelectItem>
                          <SelectItem value="social">Social media</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startsAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Starts</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endsAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ends</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Summary</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Describe the campaign objective and call-to-action." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="w-full">
                    Publish campaign
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Live campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{promotions.filter((promo) => promo.status === 'live').length}</div>
            <CardDescription>Running promotions visible to learners</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
            <CalendarRange className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{promotions.filter((promo) => promo.status === 'scheduled').length}</div>
            <CardDescription>Upcoming launches in the pipeline</CardDescription>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Campaign planner</CardTitle>
          <CardDescription>Plan and monitor marketing activities across channels.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {promotions.map((promo) => (
            <div key={promo.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{promo.title}</p>
                <StatusBadge status={promo.status} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{promo.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {new Date(promo.startsAt).toLocaleDateString()} · {promo.channel} · {new Date(promo.endsAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All campaigns</CardTitle>
          <CardDescription>Search campaigns by name or channel.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={promotions} searchPlaceholder="Search campaigns" />
        </CardContent>
      </Card>
    </div>
  );
}
