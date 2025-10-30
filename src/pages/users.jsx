import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, ShieldQuestion, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/status-badge';
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
import { apiFetch, BUSINESS_NAME } from '@/config/api';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  role: z.enum(['student', 'instructor', 'admin']),
  sendInvite: z.boolean().default(true),
});

const defaultValues = {
  name: '',
  email: '',
  role: 'student',
  sendInvite: true,
};

export default function UsersPage() {
  const [open, setOpen] = React.useState(false);
  const [users, setUsers] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [fetchError, setFetchError] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(null);
  const [deletingId, setDeletingId] = React.useState(null);
  const [deleteError, setDeleteError] = React.useState(null);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const loadUsers = React.useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    setDeleteError(null);

    try {
      const searchParams = new URLSearchParams();
      if (BUSINESS_NAME) {
        searchParams.set('businessName', BUSINESS_NAME);
      }

      const query = searchParams.toString();
      const response = await apiFetch(`/api/users${query ? `?${query}` : ''}`);
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setFetchError(error.message || 'Failed to load users.');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [BUSINESS_NAME]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  React.useEffect(() => {
    if (!open) {
      setSubmitError(null);
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          businessName: BUSINESS_NAME,
        }),
      });

      await loadUsers();
      setOpen(false);
    } catch (error) {
      setSubmitError(error.message || 'Failed to invite user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = React.useCallback(
    async (user) => {
      if (!user || !user.id) {
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to remove ${user.name || user.email} from this workspace?`,
      );

      if (!confirmed) {
        return;
      }

      setDeleteError(null);
      setDeletingId(user.id);

      try {
        const params = new URLSearchParams();
        if (BUSINESS_NAME) {
          params.set('businessName', BUSINESS_NAME);
        }

        const query = params.toString();
        await apiFetch(`/api/users/${user.id}${query ? `?${query}` : ''}`, {
          method: 'DELETE',
        });

        setUsers((prev) => prev.filter((item) => item.id !== user.id));
      } catch (error) {
        setDeleteError(error.message || 'Failed to delete user.');
      } finally {
        setDeletingId(null);
      }
    },
    [BUSINESS_NAME],
  );

  const columns = React.useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        ),
      },
      {
        header: 'Role',
        accessorKey: 'role',
        cell: ({ row }) => <span className="capitalize">{row.original.role}</span>,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: 'Joined',
        accessorKey: 'joinedAt',
        cell: ({ row }) =>
          row.original.joinedAt ? new Date(row.original.joinedAt).toLocaleDateString() : '—',
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => {
          const currentUser = row.original;
          const isDeleting = deletingId === currentUser.id;

          return (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive focus-visible:ring-destructive"
                onClick={() => handleDelete(currentUser)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          );
        },
      },
    ],
    [deletingId, handleDelete],
  );

  const directorySummary = React.useMemo(() => {
    if (isLoading) {
      return 'Loading directory...';
    }
    if (fetchError) {
      return 'Unable to load users.';
    }
    return `${users.length} members across students, instructors, and admins.`;
  }, [isLoading, fetchError, users.length]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="User management"
        description="Create, invite and moderate admins, instructors and learners."
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Invite user
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a user</DialogTitle>
              <DialogDescription>Send workspace access to admins, instructors or learners.</DialogDescription>
            </DialogHeader>
            {submitError ? (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </div>
            ) : null}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
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
                        <Input type="email" placeholder="jane@school.edu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="instructor">Instructor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Role controls permissions across admin tools.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sendInvite"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Send invitation email</FormLabel>
                        <FormDescription>Include onboarding checklist and password reset link.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send invite'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="rounded-lg border bg-card p-4">
        <header className="flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Directory</h2>
            <p className="text-sm text-muted-foreground">{directorySummary}</p>
          </div>
        </header>
        {fetchError ? (
          <div className="py-6 text-sm text-destructive">{fetchError}</div>
        ) : (
          <>
            {deleteError ? (
              <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {deleteError}
              </div>
            ) : null}

            {isLoading ? (
              <div className="py-6 text-sm text-muted-foreground">Loading users...</div>
            ) : (
              <DataTable columns={columns} data={users} searchPlaceholder="Search users" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
