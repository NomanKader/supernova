import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { apiFetch, BUSINESS_NAME } from "@/config/api";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalTrimmedString = (message, maxLength) =>
  z
    .string()
    .max(maxLength, message)
    .optional()
    .transform((value) => {
      if (typeof value !== "string") {
        return undefined;
      }
      const trimmed = value.trim();
      return trimmed.length ? trimmed : undefined;
    });

const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .optional()
    .transform((value) => {
      if (typeof value !== "string") {
        return undefined;
      }
      const trimmed = value.trim().toLowerCase();
      return trimmed.length ? trimmed : undefined;
    })
    .refine(
      (value) => {
        if (value === undefined) {
          return true;
        }
        return slugRegex.test(value);
      },
      { message: "Slug can only contain lowercase letters, numbers, and hyphens." },
    ),
  description: optionalTrimmedString("Description must be 600 characters or less.", 600),
  icon: optionalTrimmedString("Icon name must be 100 characters or less.", 100),
  color: optionalTrimmedString("Color must be 30 characters or less.", 30),
  displayOrder: z
    .preprocess((value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      const parsed = Number(value);
      return Number.isNaN(parsed) ? Number.NaN : parsed;
    }, z.number({ invalid_type_error: "Display order must be numeric." }).int().finite().optional())
    .optional(),
});

const defaultValues = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  color: "",
  displayOrder: "",
};

function sortCategories(list) {
  return [...list].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.name.localeCompare(b.name);
  });
}

export default function CourseCategoriesPage() {
  const [categories, setCategories] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [fetchError, setFetchError] = React.useState(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(null);
  const [editingCategory, setEditingCategory] = React.useState(null);
  const [deletingId, setDeletingId] = React.useState(null);
  const [deleteError, setDeleteError] = React.useState(null);

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  const querySuffix = React.useMemo(() => {
    const params = new URLSearchParams();
    if (BUSINESS_NAME) {
      params.set("businessName", BUSINESS_NAME);
    }
    const query = params.toString();
    return query ? `?${query}` : "";
  }, []);

  const adaptCategory = React.useCallback((entry) => {
    if (!entry) {
      return null;
    }

    return {
      id: entry.id,
      name: entry.name,
      slug: entry.slug,
      description: entry.description,
      icon: entry.icon,
      color: entry.color,
      displayOrder: entry.displayOrder,
      courseCount:
        entry.courseCount !== undefined && entry.courseCount !== null ? entry.courseCount : 0,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }, []);

  const loadCategories = React.useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    setDeleteError(null);

    try {
      const response = await apiFetch(`/api/course-categories${querySuffix}`);
      const data = Array.isArray(response?.data) ? response.data : [];
      const adapted = data.map(adaptCategory).filter(Boolean);
      setCategories(sortCategories(adapted));
    } catch (error) {
      setFetchError(error.message || "Failed to load categories.");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [adaptCategory, querySuffix]);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  React.useEffect(() => {
    if (!isDialogOpen) {
      setEditingCategory(null);
      setSubmitError(null);
      form.reset(defaultValues);
    }
  }, [isDialogOpen, form]);

  const openCreateDialog = () => {
    setEditingCategory(null);
    setSubmitError(null);
    form.reset(defaultValues);
    setIsDialogOpen(true);
  };

  const openEditDialog = (category) => {
    if (!category) {
      return;
    }
    setEditingCategory(category);
    setSubmitError(null);
    form.reset({
      name: category.name ?? "",
      slug: category.slug ?? "",
      description: category.description ?? "",
      icon: category.icon ?? "",
      color: category.color ?? "",
      displayOrder:
        category.displayOrder === null || category.displayOrder === undefined
          ? ""
          : String(category.displayOrder),
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);

    const payload = {
      name: values.name.trim(),
    };

    if (values.slug) {
      payload.slug = values.slug;
    }
    if (values.description) {
      payload.description = values.description;
    }
    if (values.icon) {
      payload.icon = values.icon;
    }
    if (values.color) {
      payload.color = values.color;
    }
    if (values.displayOrder !== undefined) {
      payload.displayOrder = values.displayOrder;
    }
    if (BUSINESS_NAME) {
      payload.businessName = BUSINESS_NAME;
    }

    try {
      if (editingCategory) {
        const response = await apiFetch(
          `/api/course-categories/${editingCategory.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
        );
        const updated = adaptCategory(response?.data);
        setCategories((prev) =>
          sortCategories(
            prev.map((item) => (item.id === editingCategory.id ? updated : item)),
          ),
        );
      } else {
        const response = await apiFetch("/api/course-categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const created = adaptCategory(response?.data);
        setCategories((prev) => sortCategories([...prev, created]));
      }

      setIsDialogOpen(false);
    } catch (error) {
      setSubmitError(error.message || "Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    if (!category) {
      return;
    }

    const confirmed = window.confirm(
      `Delete category "${category.name}"? Courses assigned to it will need a new category.`,
    );
    if (!confirmed) {
      return;
    }

    setDeleteError(null);
    setDeletingId(category.id);

    try {
      await apiFetch(`/api/course-categories/${category.id}${querySuffix}`, {
        method: "DELETE",
      });
      setCategories((prev) => prev.filter((item) => item.id !== category.id));
    } catch (error) {
      setDeleteError(error.message || "Failed to delete category.");
    } finally {
      setDeletingId(null);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        header: "Category",
        accessorKey: "name",
        cell: ({ row }) => {
          const category = row.original;
          return (
            <div>
              <p className="font-medium">{category.name}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                {category.slug ? <span>/{category.slug}</span> : null}
                {category.color ? (
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block h-3 w-3 rounded-full border"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.color}
                  </span>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        header: "Description",
        accessorKey: "description",
        cell: ({ row }) =>
          row.original.description ? (
            <p className="text-sm text-muted-foreground">{row.original.description}</p>
          ) : (
            <span className="text-xs text-muted-foreground">No description</span>
          ),
      },
      {
        header: "Display order",
        accessorKey: "displayOrder",
        cell: ({ row }) =>
          row.original.displayOrder !== null && row.original.displayOrder !== undefined
            ? row.original.displayOrder
            : "—",
      },
      {
        header: "Courses",
        accessorKey: "courseCount",
        cell: ({ row }) => <span className="font-medium">{row.original.courseCount}</span>,
      },
      {
        header: "Updated",
        accessorKey: "updatedAt",
        cell: ({ row }) =>
          row.original.updatedAt
            ? new Date(row.original.updatedAt).toLocaleDateString()
            : new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const category = row.original;
          const isDeleting = deletingId === category.id;

          return (
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog(category)}
                className="gap-1"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-destructive hover:text-destructive focus-visible:ring-destructive"
                onClick={() => handleDelete(category)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            </div>
          );
        },
      },
    ],
    [deletingId, handleDelete, openEditDialog],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course categories"
        description="Organize your catalog and unlock tailored browsing filters when creating or publishing courses."
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" /> New category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Update category" : "Create category"}</DialogTitle>
              <DialogDescription>
                Define curriculum groupings so learners can discover the right programs quickly.
              </DialogDescription>
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
                        <Input placeholder="Web Development" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="flex items-center justify-between">
                          <span>Slug</span>
                          <span className="text-xs font-normal text-muted-foreground">Optional</span>
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="web-development" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="What kind of courses belong here?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="flex items-center justify-between">
                            <span>Icon</span>
                            <span className="text-xs font-normal text-muted-foreground">Optional</span>
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. book-marked" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="flex items-center justify-between">
                            <span>Color</span>
                            <span className="text-xs font-normal text-muted-foreground">Optional</span>
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. #2563eb" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="flex items-center justify-between">
                            <span>Display order</span>
                            <span className="text-xs font-normal text-muted-foreground">Optional</span>
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Defaults to 0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : editingCategory ? "Save changes" : "Create category"}
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
            <h2 className="text-lg font-semibold">Categories</h2>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Loading categories..."
                : `${categories.length} categories configured for this workspace.`}
            </p>
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
            <DataTable
              columns={columns}
              data={categories}
              searchPlaceholder="Search categories"
              className="mt-4"
            />
          </>
        )}
      </div>
    </div>
  );
}



