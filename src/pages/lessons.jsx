import * as React from 'react';
import { CloudUpload, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/layout/page-header';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { lessonAssets, courses } from '@/data/mock-data';

const lessonColumns = [
  {
    header: 'Title',
    accessorKey: 'title',
  },
  {
    header: 'Type',
    accessorKey: 'type',
    cell: ({ row }) => <Badge variant="secondary">{row.original.type}</Badge>,
  },
  {
    header: 'Lesson',
    accessorKey: 'lessonId',
  },
  {
    header: 'Course',
    accessorKey: 'courseId',
    cell: ({ row }) => courses.find((course) => course.id === row.original.courseId)?.title ?? '-',
  },
  {
    header: 'Uploaded',
    accessorKey: 'uploadedAt',
    cell: ({ row }) => new Date(row.original.uploadedAt).toLocaleDateString(),
  },
];

const assetSchema = z.object({
  courseId: z.string().min(1, 'Select a course'),
  lessonId: z.string().min(2, 'Lesson identifier required'),
  title: z.string().min(3, 'Provide a title'),
  type: z.enum(['video', 'image', 'pdf']),
  url: z.string().url('Please provide an asset URL'),
  duration: z
    .union([z.literal(''), z.string()])
    .transform((value) => (value ? Number(value) : undefined))
    .refine((value) => value === undefined || value > 0, { message: 'Duration must be positive' }),
  sizeMB: z
    .union([z.literal(''), z.string()])
    .transform((value) => (value ? Number(value) : undefined))
    .refine((value) => value === undefined || value > 0, { message: 'Size must be positive' }),
  notifyLearners: z.boolean().default(false),
});

const defaultValues = {
  courseId: courses[0]?.id ?? '',
  lessonId: '',
  title: '',
  type: 'video',
  url: '',
  duration: '',
  sizeMB: '',
  notifyLearners: true,
};

export default function LessonsPage() {
  const [open, setOpen] = React.useState(false);
  const [courseFilter, setCourseFilter] = React.useState('all');

  const form = useForm({
    resolver: zodResolver(assetSchema),
    defaultValues,
  });

  const assetsForCourse = React.useCallback(
    (selected) => (selected === 'all' ? lessonAssets : lessonAssets.filter((asset) => asset.courseId === selected)),
    [],
  );

  const onSubmit = (values) => {
    console.log('Upload lesson asset', values);
    setOpen(false);
    form.reset(defaultValues);
  };

  const renderAssetTable = (selected) => {
    const assets = assetsForCourse(selected);
    return (
      <div className="rounded-lg border bg-card p-4">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h2 className="text-lg font-semibold">Assets</h2>
            <p className="text-sm text-muted-foreground">{assets.length} items stored for this selection.</p>
          </div>
        </header>
        <DataTable columns={lessonColumns} data={assets} searchPlaceholder="Search lesson assets" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lesson library"
        description="Upload lesson media, attach resources and manage per-course assets."
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Upload asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload lesson asset</DialogTitle>
              <DialogDescription>Store resources alongside guided lessons for learners.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="lessonId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lesson identifier</FormLabel>
                        <FormControl>
                          <Input placeholder="lesson-5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="pdf">PDF</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset title</FormLabel>
                      <FormControl>
                        <Input placeholder="Project setup & tooling" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://cdn.supernova.dev/lesson.mp4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (seconds)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="600" value={field.value ?? ''} onChange={(event) => field.onChange(event.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sizeMB"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File size (MB)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="120" value={field.value ?? ''} onChange={(event) => field.onChange(event.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notifyLearners"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Notify enrolled learners</FormLabel>
                        <FormDescription>Send update digest with new content summary.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="w-full">
                    <CloudUpload className="mr-2 h-4 w-4" /> Register asset
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Tabs value={courseFilter} onValueChange={setCourseFilter} className="w-full">
        <TabsList className="flex-wrap justify-start bg-muted">
          <TabsTrigger value="all">All courses</TabsTrigger>
          {courses.map((course) => (
            <TabsTrigger key={course.id} value={course.id}>
              {course.title}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all">{renderAssetTable('all')}</TabsContent>
        {courses.map((course) => (
          <TabsContent key={course.id} value={course.id}>
            {renderAssetTable(course.id)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
