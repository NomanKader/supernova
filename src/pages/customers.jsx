import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/layout/page-header';
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
import { Textarea } from '@/components/ui/textarea';
import { apiFetch, BUSINESS_NAME } from '@/config/api';

const formSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  phoneNumber: z.string().min(6, 'Phone number must have at least 6 digits'),
  address: z.string().min(5, 'Address is required'),
});

const defaultValues = {
  name: '',
  phoneNumber: '',
  address: '',
};

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [fetchError, setFetchError] = React.useState(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(null);
  const [editingCustomer, setEditingCustomer] = React.useState(null);
  const [deletingId, setDeletingId] = React.useState(null);
  const [deleteError, setDeleteError] = React.useState(null);
  const [successMessage, setSuccessMessage] = React.useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const loadCustomers = React.useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    setDeleteError(null);

    try {
      const params = new URLSearchParams();
      if (BUSINESS_NAME) {
        params.set('businessName', BUSINESS_NAME);
      }

      const query = params.toString();
      const response = await apiFetch(`/api/customers${query ? `?${query}` : ''}`);
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setFetchError(error.message || 'Failed to load customers.');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  React.useEffect(() => {
    if (!isDialogOpen) {
      setSaveError(null);
      setEditingCustomer(null);
      form.reset(defaultValues);
    } else if (editingCustomer) {
      form.reset({
        name: editingCustomer.name || '',
        phoneNumber: editingCustomer.phoneNumber || '',
        address: editingCustomer.address || '',
      });
    }
  }, [isDialogOpen, editingCustomer, form]);

  React.useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = setTimeout(() => setSuccessMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
  };

  const onSubmit = async (values) => {
    setIsSaving(true);
    setSaveError(null);
    setSuccessMessage(null);

    const payload = {
      ...values,
      businessName: BUSINESS_NAME,
    };

    const isEditing = Boolean(editingCustomer);
    const endpoint = isEditing ? `/api/customers/${editingCustomer.id}` : '/api/customers';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      await loadCustomers();
      closeDialog();
      setSuccessMessage(isEditing ? 'Customer updated successfully.' : 'Customer created successfully.');
    } catch (error) {
      setSaveError(error.message || 'Failed to save customer.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = React.useCallback(
    async (customer) => {
      if (!customer || !customer.id) {
        return;
      }

      const confirmed = window.confirm(`Are you sure you want to delete ${customer.name}?`);
      if (!confirmed) {
        return;
      }

      setDeleteError(null);
      setDeletingId(customer.id);

      try {
        const params = new URLSearchParams();
        if (BUSINESS_NAME) {
          params.set('businessName', BUSINESS_NAME);
        }

        const query = params.toString();
        await apiFetch(`/api/customers/${customer.id}${query ? `?${query}` : ''}`, {
          method: 'DELETE',
        });

        setCustomers((prev) => prev.filter((item) => item.id !== customer.id));
        setSuccessMessage('Customer deleted successfully.');
      } catch (error) {
        setDeleteError(error.message || 'Failed to delete customer.');
      } finally {
        setDeletingId(null);
      }
    },
    [],
  );

  const columns = React.useMemo(
    () => [
      {
        header: 'Customer',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.phoneNumber}</p>
          </div>
        ),
      },
      {
        header: 'Address',
        accessorKey: 'address',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.address}</span>
        ),
      },
      {
        header: 'Created',
        accessorKey: 'createdAt',
        cell: ({ row }) =>
          row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '—',
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => {
          const currentCustomer = row.original;
          const isDeleting = deletingId === currentCustomer.id;

          return (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingCustomer(currentCustomer);
                  setIsDialogOpen(true);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive focus-visible:ring-destructive"
                onClick={() => handleDelete(currentCustomer)}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
      return 'Loading customers...';
    }
    if (fetchError) {
      return 'Unable to load customers.';
    }
    return `${customers.length} customers tracked for this workspace.`;
  }, [isLoading, fetchError, customers.length]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Track your buyers, capture delivery details, and keep invoices tidy."
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => setEditingCustomer(null)}>
              <Plus className="h-4 w-4" />
              New customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCustomer ? 'Edit customer' : 'Add a customer'}</DialogTitle>
              <DialogDescription>
                Store contact and delivery preferences for every account you work with.
              </DialogDescription>
            </DialogHeader>
            {saveError ? (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {saveError}
              </div>
            ) : null}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Trading Co." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone number</FormLabel>
                      <FormControl>
                        <Input placeholder="+95 9 123 456 789" {...field} />
                      </FormControl>
                      <FormDescription>Include the dial code to speed up order follow-ups.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Street, township, city..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? 'Saving...' : editingCustomer ? 'Save changes' : 'Create customer'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {successMessage ? (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
          <div className="flex-1">
            <p className="font-semibold leading-tight">Update saved</p>
            <p className="text-sm text-emerald-800">{successMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="rounded-md p-1 text-emerald-700 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="rounded-lg border bg-card p-4">
        <header className="flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Customer directory</h2>
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
              <div className="py-6 text-sm text-muted-foreground">Loading customers...</div>
            ) : (
              <DataTable columns={columns} data={customers} searchPlaceholder="Search customers" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
