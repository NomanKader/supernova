import * as React from 'react';
import { BookMarked, ImageUp, Loader2, Plus, Pencil } from 'lucide-react';
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
  FormDescription,
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
import { Combobox } from '@/components/ui/combobox';
import { apiFetch, BUSINESS_NAME } from '@/config/api';
import { buildAssetUrl } from '@/utils/course';
import { categories as mockCategories, users } from '@/data/mock-data';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const isFileInstance = (value) => typeof File !== 'undefined' && value instanceof File;

const courseSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  instructorId: z.string().min(1, 'Select an instructor'),
  categoryId: z.string().min(1, 'Select a category'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  status: z.enum(['active', 'inactive']),
  price: z.coerce
    .number({
      invalid_type_error: 'Price must be a number or zero for free courses',
    })
    .min(0, 'Price cannot be negative'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  coverImage: z
    .any()
    .optional()
    .refine(
      (file) => file == null || (isFileInstance(file) && file.size > 0),
      'Course image must have a file attached',
    )
    .refine(
      (file) => file == null || (isFileInstance(file) && file.type.startsWith('image/')),
      'Course image must be an image file',
    )
    .refine(
      (file) => file == null || (isFileInstance(file) && file.size <= MAX_IMAGE_SIZE),
      'Course image must be 5 MB or smaller',
    ),
});

const defaultValues = {
  title: '',
  instructorId: '',
  categoryId: '',
  level: 'beginner',
  status: 'active',
  price: 0,
  description: '',
  coverImage: null,
};

function normalizeCategories(source = []) {
  return source
    .map((category) => {
      if (!category) {
        return null;
      }

      const id =
        category.id !== undefined && category.id !== null
          ? String(category.id)
          : category.slug || category.name;

      if (!id) {
        return null;
      }

      return {
        id,
        slug: category.slug ?? null,
        name: category.name ?? 'Untitled category',
        description: category.description ?? '',
        color: category.color ?? null,
        displayOrder: category.displayOrder ?? null,
        courseCount:
          category.courseCount !== undefined && category.courseCount !== null
            ? Number(category.courseCount)
            : null,
      };
    })
    .filter(Boolean);
}

function normalizeInstructors(source = []) {
  return source
    .filter((instructor) => {
      if (!instructor) return false;
      const role = (instructor.role || '').toLowerCase();
      return role === 'instructor' || role === 'mentor';
    })
    .map((instructor) => ({
      id: instructor.id ?? instructor.email,
      name: instructor.name || instructor.email || 'Unnamed instructor',
      email: instructor.email,
    }));
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) {
    return '';
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
}

function CoverImageDropzone({
  value,
  onChange,
  onBlur,
  fieldRef,
  inputRef,
  disabled,
  existingPreviewUrl,
}) {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState(existingPreviewUrl || null);
  const dragCounter = React.useRef(0);
  const internalInputRef = React.useRef(null);

  const assignInputRef = React.useCallback(
    (node) => {
      internalInputRef.current = node;
      if (typeof fieldRef === 'function') {
        fieldRef(node);
      } else if (fieldRef && 'current' in fieldRef) {
        fieldRef.current = node;
      }
      if (inputRef) {
        inputRef.current = node;
      }
    },
    [fieldRef, inputRef],
  );

  const setFileValue = React.useCallback(
    (file) => {
      onChange(file);
      if (typeof onBlur === 'function') {
        onBlur();
      }
      if (internalInputRef.current) {
        internalInputRef.current.value = '';
      }
    },
    [onChange, onBlur],
  );

  const handleFiles = React.useCallback(
    (fileList) => {
      if (!fileList || !fileList.length) {
        return;
      }
      const file = fileList[0];
      if (file) {
        setFileValue(file);
      }
    },
    [setFileValue],
  );

  const handleInputChange = React.useCallback(
    (event) => {
      handleFiles(event.target.files);
    },
    [handleFiles],
  );

  const handleDrop = React.useCallback(
    (event) => {
      event.preventDefault();
      dragCounter.current = 0;
      setIsDragActive(false);
      if (disabled) {
        return;
      }
      handleFiles(event.dataTransfer?.files);
    },
    [disabled, handleFiles],
  );

  const handleDragEnter = React.useCallback((event) => {
    event.preventDefault();
    if (disabled) {
      return;
    }
    dragCounter.current += 1;
    setIsDragActive(true);
  }, [disabled]);

  const handleDragLeave = React.useCallback((event) => {
    event.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) {
      setIsDragActive(false);
    }
  }, []);

  const handleDragOver = React.useCallback((event) => {
    event.preventDefault();
  }, []);

  const handlePaste = React.useCallback(
    (event) => {
      if (disabled) {
        return;
      }
      const files = event.clipboardData?.files;
      if (files && files.length) {
        event.preventDefault();
        handleFiles(files);
      }
    },
    [disabled, handleFiles],
  );

  const handleClick = React.useCallback(() => {
    if (disabled) {
      return;
    }
    internalInputRef.current?.click();
  }, [disabled]);

  const handleKeyDown = React.useCallback(
    (event) => {
      if (disabled) {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        internalInputRef.current?.click();
      }
    },
    [disabled],
  );

  const handleClear = React.useCallback(() => {
    if (disabled) {
      return;
    }
    setFileValue(null);
    setPreviewUrl(null);
  }, [disabled, setFileValue]);

  React.useEffect(() => {
    if (value && isFileInstance(value)) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
    setPreviewUrl(existingPreviewUrl || null);
    return undefined;
  }, [value, existingPreviewUrl]);

  const hasFile = value && isFileInstance(value);
  const hasPreview = !!previewUrl;

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={assignInputRef}
        onChange={handleInputChange}
        onBlur={onBlur}
        className="sr-only"
        tabIndex={-1}
      />
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onPaste={handlePaste}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
          disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
        } ${isDragActive ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500'}`}
      >
        <ImageUp className="h-10 w-10 text-current" aria-hidden="true" />
        <p className="mt-3 text-base font-semibold text-gray-900">
          {hasFile ? 'Replace image' : 'Drag & drop your cover image'}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {disabled
            ? 'Uploading is disabled right now'
            : 'Click to browse or press Ctrl+V to paste from your clipboard.'}
        </p>
        <p className="mt-1 text-xs text-gray-400">PNG, JPG, GIF up to 5 MB.</p>
        {hasPreview ? (
          <div className="mt-4 w-full rounded-xl border border-dashed border-gray-200 bg-white/70 p-3 text-left">
            <div className="flex items-center gap-3">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={hasFile ? value.name : 'Current course cover'}
                  className="h-14 w-14 rounded-lg object-cover"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {hasFile ? value.name : 'Current cover image'}
                </p>
                <p className="text-xs text-gray-500">
                  {hasFile ? formatFileSize(value.size) : 'Stored on the server'}
                </p>
              </div>
              {hasFile ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default function CoursesPage() {
  const [open, setOpen] = React.useState(false);
  const [editingCourse, setEditingCourse] = React.useState(null);
  const [categoryFilter, setCategoryFilter] = React.useState(null);
  const initialMockCategories = React.useMemo(() => normalizeCategories(mockCategories), []);
  const [categoryOptions, setCategoryOptions] = React.useState(initialMockCategories);
  const [categoriesLoading, setCategoriesLoading] = React.useState(false);
  const [categoriesError, setCategoriesError] = React.useState(null);
  const initialMockInstructors = React.useMemo(() => normalizeInstructors(users), []);
  const [instructorOptions, setInstructorOptions] = React.useState(initialMockInstructors);
  const [instructorsLoading, setInstructorsLoading] = React.useState(false);
  const [instructorsError, setInstructorsError] = React.useState(null);
  const [coursesData, setCoursesData] = React.useState([]);
  const [coursesLoading, setCoursesLoading] = React.useState(true);
  const [coursesError, setCoursesError] = React.useState(null);
  const [creatingCourse, setCreatingCourse] = React.useState(false);
  const [createError, setCreateError] = React.useState(null);
  const fileInputRef = React.useRef(null);
  const isEditing = Boolean(editingCourse);
  const editingPreviewUrl = React.useMemo(
    () => (editingCourse?.imageUrl ? buildAssetUrl(editingCourse.imageUrl) : null),
    [editingCourse],
  );

  const querySuffix = React.useMemo(() => {
    const params = new URLSearchParams();
    if (BUSINESS_NAME) {
      params.set('businessName', BUSINESS_NAME);
    }
    const query = params.toString();
    return query ? `?${query}` : '';
  }, []);

  const adminCoursesPath = React.useMemo(
    () => `/api/courses${querySuffix ? `${querySuffix}&status=all` : '?status=all'}`,
    [querySuffix],
  );

  const loadCategories = React.useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);

    try {
      const response = await apiFetch(`/api/course-categories${querySuffix}`);
      const data = Array.isArray(response?.data) ? response.data : [];
      const normalized = normalizeCategories(data);
      setCategoryOptions(normalized);
    } catch (error) {
      setCategoriesError(error.message || 'Failed to load categories from the server.');
      setCategoryOptions(initialMockCategories);
    } finally {
      setCategoriesLoading(false);
    }
  }, [initialMockCategories, querySuffix]);

  const loadInstructors = React.useCallback(async () => {
    setInstructorsLoading(true);
    setInstructorsError(null);

    try {
      const response = await apiFetch(`/api/users${querySuffix}`);
      const data = Array.isArray(response?.data) ? response.data : [];
      const normalized = normalizeInstructors(data);
      setInstructorOptions(normalized);
    } catch (error) {
      setInstructorsError(error.message || 'Failed to load instructors from the server.');
      setInstructorOptions(initialMockInstructors);
    } finally {
      setInstructorsLoading(false);
    }
  }, [initialMockInstructors, querySuffix]);

  const loadCourses = React.useCallback(async () => {
    setCoursesLoading(true);
    setCoursesError(null);

    try {
      const response = await apiFetch(adminCoursesPath);
      const payload = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setCoursesData(payload);
    } catch (error) {
      setCoursesError(error.message || 'Failed to load courses from the server.');
      setCoursesData([]);
    } finally {
      setCoursesLoading(false);
    }
  }, [adminCoursesPath]);

  const handleEditCourse = React.useCallback((course) => {
    setEditingCourse(course);
    setOpen(true);
  }, []);

  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues,
  });

  React.useEffect(() => {
    loadCategories();
    loadInstructors();
    loadCourses();
  }, [loadCategories, loadInstructors, loadCourses]);

  React.useEffect(() => {
    if (categoryOptions.length) {
      const current = form.getValues('categoryId');
      if (!current) {
        form.setValue('categoryId', String(categoryOptions[0].id));
      }
    }
  }, [categoryOptions, form]);

  React.useEffect(() => {
    if (instructorOptions.length) {
      const current = form.getValues('instructorId');
      if (!current) {
        form.setValue('instructorId', String(instructorOptions[0].id));
      }
    }
  }, [instructorOptions, form]);

  React.useEffect(() => {
    if (editingCourse) {
      form.reset({
        title: editingCourse.title ?? '',
        categoryId: String(editingCourse.categoryId ?? categoryOptions[0]?.id ?? ''),
        instructorId: String(
          editingCourse.instructorIds?.[0] ??
            editingCourse.instructorId ??
            instructorOptions[0]?.id ??
            '',
        ),
        level:
          typeof editingCourse.level === 'string' && editingCourse.level
            ? editingCourse.level
            : 'beginner',
        status: editingCourse.status === 'active' ? 'active' : 'inactive',
        price: Number.isFinite(editingCourse.price) ? Number(editingCourse.price) : 0,
        description: editingCourse.description ?? '',
        coverImage: null,
      });
    }
  }, [editingCourse, form, categoryOptions, instructorOptions]);

  React.useEffect(() => {
    if (!open) {
      setCreateError(null);
      form.reset({
        ...defaultValues,
        categoryId: categoryOptions[0]?.id ?? '',
        instructorId: instructorOptions[0]?.id ?? '',
        status: 'active',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setEditingCourse(null);
    }
  }, [open, form, categoryOptions, instructorOptions]);

  const categoryLookup = React.useMemo(() => {
    const byId = new Map();
    const bySlug = new Map();
    const byName = new Map();

    categoryOptions.forEach((category) => {
      byId.set(String(category.id), category);
      if (category.slug) {
        bySlug.set(category.slug, category);
      }
      if (category.name) {
        byName.set(category.name.toLowerCase(), category);
      }
    });

    return { byId, bySlug, byName };
  }, [categoryOptions]);

  const filteredCourses = React.useMemo(() => {
    if (!categoryFilter) {
      return coursesData;
    }

    const filterLower = categoryFilter.toLowerCase();
    const filterCategory =
      categoryLookup.byId.get(categoryFilter) ||
      categoryLookup.bySlug.get(categoryFilter) ||
      categoryLookup.byName.get(filterLower);

    return coursesData.filter((course) => {
      const key = course.categoryId ? String(course.categoryId) : '';
      if (!key) {
        return false;
      }
      if (key === categoryFilter) {
        return true;
      }

      const courseCategory =
        categoryLookup.byId.get(key) ||
        categoryLookup.bySlug.get(key) ||
        categoryLookup.byName.get(key.toLowerCase());

      if (!filterCategory || !courseCategory) {
        return false;
      }

      return String(courseCategory.id) === String(filterCategory.id);
    });
  }, [categoryFilter, categoryLookup, coursesData]);

  const publishingQueue = React.useMemo(
    () => coursesData.filter((course) => (course.status || '').toLowerCase() !== 'active'),
    [coursesData],
  );

  const columns = React.useMemo(
    () => [
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
        cell: ({ row }) => {
          const key = row.original.categoryId ? String(row.original.categoryId) : '';
          const category =
            categoryLookup.byId.get(key) ||
            categoryLookup.bySlug.get(key) ||
            categoryLookup.byName.get(key.toLowerCase());
          return category ? category.name : '-';
        },
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
        cell: ({ row }) => {
          const value = row.original.updatedAt;
          if (!value) {
            return '-';
          }
          const parsed = new Date(value);
          return Number.isNaN(parsed.getTime()) ? '-' : parsed.toLocaleDateString();
        },
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary"
            onClick={() => handleEditCourse(row.original)}
          >
            <Pencil className="mr-1 h-4 w-4" />
            Edit
          </Button>
        ),
      },
    ],
    [categoryLookup, handleEditCourse],
  );

  const onSubmit = async (values) => {
    setCreateError(null);
    setCreatingCourse(true);

    try {
      const editing = Boolean(editingCourse);
      if (!editing && !isFileInstance(values.coverImage)) {
        form.setError('coverImage', { type: 'manual', message: 'Course image is required.' });
        setCreatingCourse(false);
        return;
      }

      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('categoryId', values.categoryId);
      formData.append('instructorId', values.instructorId);
      formData.append('level', values.level);
      formData.append('status', values.status);
      formData.append('price', values.price != null ? String(values.price) : '0');
      if (isFileInstance(values.coverImage)) {
        formData.append('image', values.coverImage);
      }

      const endpoint = editing
        ? `/api/courses/${editingCourse.id}${querySuffix}`
        : `/api/courses${querySuffix}`;
      const response = await apiFetch(endpoint, {
        method: editing ? 'PUT' : 'POST',
        body: formData,
      });
      const created =
        response && typeof response === 'object'
          ? response.data && typeof response.data === 'object'
            ? response.data
            : response
          : null;

      if (created && typeof created === 'object') {
        setCoursesData((previous) => {
          if (editing) {
            return previous.map((course) => (course.id === created.id ? created : course));
          }
          const withoutDuplicate = previous.filter((course) => course.id !== created.id);
          return [created, ...withoutDuplicate];
        });
      } else {
        await loadCourses();
      }

      setOpen(false);
      form.reset({
        ...defaultValues,
        categoryId: categoryOptions[0]?.id ?? '',
        instructorId: instructorOptions[0]?.id ?? '',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setCreateError(error.message || 'Failed to create course.');
    } finally {
      setCreatingCourse(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course catalogue"
        description="Manage categories, course health and publishing lifecycle."
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="flex items-center gap-2"
              onClick={() => {
                setEditingCourse(null);
              }}
            >
              <Plus className="h-4 w-4" /> New course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit course' : 'Create new course'}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Update the course details, pricing, and visibility status.'
                  : 'Start a new course blueprint. You can add lessons and assets after saving.'}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Course title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Design systems masterclass" {...field} />
                        </FormControl>
                        <FormDescription>Give learners a clear, action-oriented title.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Choose category</FormLabel>
                        <FormControl>
                          <Combobox
                            value={field.value}
                            onChange={field.onChange}
                            disabled={!categoryOptions.length}
                            options={categoryOptions.map((category) => ({
                              value: String(category.id),
                              label: category.name,
                              description: category.description || undefined,
                            }))}
                            placeholder={
                              categoryOptions.length
                                ? 'Search or select a category'
                                : categoriesLoading
                                ? 'Loading categories...'
                                : 'No categories available'
                            }
                            searchPlaceholder="Type to filter categories..."
                            emptyMessage="No categories found."
                          />
                        </FormControl>
                        {categoryOptions.length ? (
                          <FormDescription>
                            Use categories to group courses for easier browsing.
                          </FormDescription>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Create a category first so you can organize courses under a catalog group.
                          </p>
                        )}
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
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (USD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Enter 0 to make this course free.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Only active courses are visible on the public site.
                        </FormDescription>
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
                      <FormControl>
                        <Combobox
                          value={field.value}
                          onChange={field.onChange}
                          disabled={!instructorOptions.length}
                          options={instructorOptions.map((instructor) => ({
                            value: String(instructor.id),
                            label: instructor.name,
                            description: instructor.email || undefined,
                          }))}
                          placeholder={
                            instructorOptions.length
                              ? 'Search or select an instructor'
                              : instructorsLoading
                              ? 'Loading instructors...'
                              : 'No instructors available'
                          }
                          searchPlaceholder="Type to filter instructors..."
                          emptyMessage="No instructors found."
                          loading={instructorsLoading}
                        />
                      </FormControl>
                      {instructorsError ? (
                        <p className="text-xs text-destructive">{instructorsError}</p>
                      ) : null}
                      {instructorOptions.length ? (
                        <FormDescription>
                          Choose who will own this course. Use the Users tab to invite more instructors.
                        </FormDescription>
                      ) : !instructorsLoading ? (
                        <p className="text-xs text-muted-foreground">
                          Invite an instructor from the Users page to make them available here.
                        </p>
                      ) : null}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course image</FormLabel>
                      <FormControl>
                        <CoverImageDropzone
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          fieldRef={field.ref}
                          inputRef={fileInputRef}
                          disabled={creatingCourse}
                          existingPreviewUrl={isEditing ? editingPreviewUrl : null}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload a single cover image (max 5 MB).
                        {isEditing && editingCourse?.imageUrl
                          ? ' The existing image will be kept if you do not upload a new file.'
                          : null}
                      </FormDescription>
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
                {createError ? (
                  <p className="text-sm text-destructive">{createError}</p>
                ) : null}
                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={creatingCourse}>
                    {creatingCourse ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditing ? 'Updating...' : 'Saving...'}
                      </>
                    ) : (
                      (isEditing ? 'Save changes' : 'Create blueprint')
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categoriesLoading ? (
          <div className="col-span-full rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
            Loading categories&hellip;
          </div>
        ) : categoryOptions.length ? (
          categoryOptions.map((category) => {
            const isActive = String(category.id) === categoryFilter;
            const fallbackCount = coursesData.filter((course) => {
              const key = course.categoryId ? String(course.categoryId) : '';
              if (!key) {
                return false;
              }
              if (key === String(category.id)) {
                return true;
              }
              if (category.slug && key === category.slug) {
                return true;
              }
              if (category.name && key.toLowerCase() === category.name.toLowerCase()) {
                return true;
              }
              return false;
            }).length;
            const rawCourseCount =
              category.courseCount !== null && category.courseCount !== undefined
                ? Number(category.courseCount)
                : null;
            const safeCourseCount = Number.isFinite(rawCourseCount) ? rawCourseCount : 0;
            const count = Math.max(fallbackCount, safeCourseCount);

            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setCategoryFilter(isActive ? null : String(category.id))
                }
                className="flex flex-col items-start rounded-xl border bg-card p-4 text-left transition hover:border-primary"
              >
                <div className="flex items-center gap-3">
                  <BookMarked className="h-5 w-5 text-primary" />
                  <p className="font-semibold">{category.name}</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {category.description || 'No description yet.'}
                </p>
                <Badge variant={isActive ? 'default' : 'secondary'} className="mt-4">
                  {count} {count === 1 ? 'course' : 'courses'}
                </Badge>
              </button>
            );
          })
        ) : (
          <div className="col-span-full rounded-xl border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            No categories yet. Create your first category to organize the catalog.
          </div>
        )}
      </section>
      {categoriesError ? (
        <div className="text-sm text-destructive">{categoriesError}</div>
      ) : null}

      <div className="rounded-lg border bg-card p-4">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h2 className="text-lg font-semibold">Courses</h2>
            <p className="text-sm text-muted-foreground">
              {filteredCourses.length} of {coursesData.length} total courses visible.
            </p>
          </div>
          {publishingQueue.length > 0 ? (
            <Badge variant="secondary">{publishingQueue.length} need activation</Badge>
          ) : null}
        </header>
        {coursesError ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <span>{coursesError}</span>
            <Button variant="outline" size="sm" onClick={loadCourses} disabled={coursesLoading}>
              Retry
            </Button>
          </div>
        ) : null}
        {coursesLoading && !coursesData.length ? (
          <div className="mt-6 flex h-40 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading courses...
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={filteredCourses} searchPlaceholder="Search courses" />
            {!coursesLoading && !coursesError && !filteredCourses.length ? (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                {coursesData.length
                  ? 'No courses match the current filters.'
                  : 'No courses yet. Use the "New course" button to create one.'}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}





