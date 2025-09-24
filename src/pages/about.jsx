import * as React from 'react';
import { Pencil, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { aboutPageBlocks } from '@/data/mock-data';

const blockSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
});

export default function AboutPage() {
  const [selected, setSelected] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(blockSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const handleEdit = (block) => {
    setSelected(block);
    form.reset({ title: block.title, content: block.content });
    setOpen(true);
  };

  const handleCreate = () => {
    setSelected(null);
    form.reset({ title: '', content: '' });
    setOpen(true);
  };

  const onSubmit = (values) => {
    console.log('Save about block', { id: selected?.id, ...values });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="About page" description="Curate the story, mission and team presence for learners.">
        <Button className="flex items-center gap-2" onClick={handleCreate}>
          <Plus className="h-4 w-4" /> New section
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Content blocks</CardTitle>
          <CardDescription>Review and order the sections visible on the About page.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {aboutPageBlocks.map((block) => (
            <div key={block.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{block.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{block.content}</p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => handleEdit(block)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Updated {new Date(block.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected ? 'Edit section' : 'New section'}</DialogTitle>
            <DialogDescription>Update copy that appears on the public About page.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heading</FormLabel>
                    <FormControl>
                      <Input placeholder="Our mission" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="Add descriptive copy..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="w-full">
                  Save content
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
