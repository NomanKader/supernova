import * as React from 'react';
import { BookMarked, Plus } from 'lucide-react';
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
import { courses, categories, users } from '@/data/mock-data';

const courseColumns = [
  {
    header: 'Course',
    accessorKey: 'title',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.title}</p>
        <p className="text-xs text-muted-foreground">{row.original.description}</p>
      </div>
    ),
  },
  {
    header: 'Category',
    accessorKey: 'categoryId',
    cell: ({ row }) => categories.find((cat) => cat.id === row.original.categoryId)?.name ?? '-',
  },
  {
    header: 'Level',
    accessorKey: 'level',
    cell: ({ row }) => <span className="capitalize">{row.original.level}</span>,
  },
  {
    header: 'Lessons',
    accessorKey: 'lessons',
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    header: 'Updated',
    accessorKey: 'updatedAt',
    cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
  },
];

const courseSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  instructorId: z.string().min(1, 'Select an instructor'),
  categoryId: z.string().min(1, 'Select a category'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

const defaultValues = {
  title: '',
  instructorId: users.find((user) => user.role !== 'student')?.id ?? '',
  categoryId: categories[0]?.id ?? '',
  level: 'beginner',
  description: '',
};

export default function CoursesPage() {
  const [open, setOpen] = React.useState(false);
  const [categoryFilter, setCategoryFilter] = React.useState(null);

  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues,
  });

  const filteredCourses = React.useMemo(() => {
    if (!categoryFilter) return courses;
    return courses.filter((course) => course.categoryId === categoryFilter);
  }, [categoryFilter]);

  const publishingQueue = courses.filter((course) => course.status !== 'published');

  const onSubmit = (values) => {
    console.log('Create course', values);
    setOpen(false);
    form.reset(defaultValues);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course catalogue"
        description="Manage categories, course health and publishing lifecycle."
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New course blueprint</DialogTitle>
              <DialogDescription>Define the core metadata to start lesson production.</DialogDescription>
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
                        <Input placeholder="Launch resilient APIs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="categoryId"
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
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
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
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="instructorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead instructor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select instructor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users
                            .filter((user) => user.role !== 'student')
                            .map((instructor) => (
                              <SelectItem key={instructor.id} value={instructor.id}>
                                {instructor.name}
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Summary</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="What will learners accomplish?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="w-full">
                    Create blueprint
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => {
          const inCategory = courses.filter((course) => course.categoryId === category.id);
          const isActive = category.id === categoryFilter;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryFilter(isActive ? null : category.id)}
              className="flex flex-col items-start rounded-xl border bg-card p-4 text-left transition hover:border-primary"
            >
              <div className="flex items-center gap-3">
                <BookMarked className="h-5 w-5 text-primary" />
                <p className="font-semibold">{category.name}</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
              <Badge variant={isActive ? 'default' : 'secondary'} className="mt-4">
                {inCategory.length} courses
              </Badge>
            </button>
          );
        })}
      </section>

      <div className="rounded-lg border bg-card p-4">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h2 className="text-lg font-semibold">Courses</h2>
            <p className="text-sm text-muted-foreground">
              {filteredCourses.length} of {courses.length} total courses visible.
            </p>
          </div>
          {publishingQueue.length > 0 ? (
            <Badge variant="secondary">{publishingQueue.length} in publish queue</Badge>
          ) : null}
        </header>
        <DataTable columns={courseColumns} data={filteredCourses} searchPlaceholder="Search courses" />
      </div>
    </div>
  );
}
