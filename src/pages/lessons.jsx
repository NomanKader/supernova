import * as React from 'react';
import { AlertCircle, CheckCircle2, CloudUpload, Loader2, Plus, Trash2 } from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { apiFetch, BUSINESS_NAME, API_BASE_URL } from '@/config/api';
import { formatDurationLabel } from '@/utils/course';

const MAX_LESSONS = 50;
const DIRECT_UPLOAD_DEFAULT_PART_SIZE = 15 * 1024 * 1024;

function makeLessonDraft(position) {
  return {
    lessonNumber: position,
    title: '',
    description: '',
    durationSeconds: null,
    file: null,
    progress: 0,
    status: 'pending',
    error: null,
  };
}

function rebuildLessonDrafts(existing, desiredCount) {
  const safeCount = Math.min(Math.max(Number.isFinite(desiredCount) ? desiredCount : 1, 1), MAX_LESSONS);
  const next = [];

  for (let index = 0; index < safeCount; index += 1) {
    if (existing[index]) {
      next.push({
        ...existing[index],
        lessonNumber: Number.isFinite(existing[index].lessonNumber)
          ? existing[index].lessonNumber
          : index + 1,
      });
    } else {
      next.push(makeLessonDraft(index + 1));
    }
  }

  return next;
}

function computeOverallProgress(drafts) {
  if (!drafts.length) {
    return 0;
  }
  const total = drafts.reduce((sum, draft) => sum + (draft.progress ?? 0), 0);
  return Math.round(total / drafts.length);
}

const initialDrafts = [makeLessonDraft(1)];

export default function LessonsPage() {
  const [open, setOpen] = React.useState(false);
  const [courses, setCourses] = React.useState([]);
  const [coursesLoading, setCoursesLoading] = React.useState(true);
  const [coursesError, setCoursesError] = React.useState(null);

  const [lessons, setLessons] = React.useState([]);
  const [lessonsLoading, setLessonsLoading] = React.useState(true);
  const [lessonsError, setLessonsError] = React.useState(null);

  const [courseFilter, setCourseFilter] = React.useState('all');
  const [selectedCourseId, setSelectedCourseId] = React.useState('');
  const [totalLessons, setTotalLessons] = React.useState(1);
  const [totalLessonsInput, setTotalLessonsInput] = React.useState('1');
  const [lessonDrafts, setLessonDrafts] = React.useState(initialDrafts);
  const [uploadError, setUploadError] = React.useState(null);
  const [overallProgress, setOverallProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const directUploadSupportedRef = React.useRef(true);
  const [deletingLessonId, setDeletingLessonId] = React.useState(null);
  const [deleteError, setDeleteError] = React.useState(null);

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

  const loadCourses = React.useCallback(async () => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const response = await apiFetch(adminCoursesPath);
      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setCourses(data);
    } catch (error) {
      setCoursesError(error.message || 'Failed to load courses.');
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, [adminCoursesPath]);

  const loadLessons = React.useCallback(async () => {
    setLessonsLoading(true);
    setLessonsError(null);
    try {
      const response = await apiFetch(`/api/lessons${querySuffix}`);
      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setLessons(data);
    } catch (error) {
      setLessonsError(error.message || 'Failed to load lessons.');
      setLessons([]);
    } finally {
      setLessonsLoading(false);
    }
  }, [querySuffix]);

  React.useEffect(() => {
    loadCourses();
    loadLessons();
  }, [loadCourses, loadLessons]);

  React.useEffect(() => {
    if (courses.length && !selectedCourseId) {
      setSelectedCourseId(String(courses[0].id));
    }
  }, [courses, selectedCourseId]);

  React.useEffect(() => {
    setLessonDrafts((previous) => rebuildLessonDrafts(previous, totalLessons));
  }, [totalLessons]);

  React.useEffect(() => {
    if (!open) {
      setTotalLessons(1);
      setTotalLessonsInput('1');
      setLessonDrafts(initialDrafts);
      setUploadError(null);
      setOverallProgress(0);
      setIsUploading(false);
      setUploadSuccess(false);
    }
  }, [open]);

  const courseLookup = React.useMemo(() => {
    const map = new Map();
    courses.forEach((course) => map.set(String(course.id), course));
    return map;
  }, [courses]);

  const buildLessonDeletePath = React.useCallback(
    (lessonId) => {
      const params = new URLSearchParams();
      if (BUSINESS_NAME) {
        params.set('businessName', BUSINESS_NAME);
      }
      const query = params.toString();
      return `/api/lessons/${lessonId}${query ? `?${query}` : ''}`;
    },
    [],
  );

  const handleDeleteLesson = React.useCallback(
    async (lessonId) => {
      if (!lessonId) {
        return;
      }
      const confirmed =
        typeof window === 'undefined'
          ? true
          : window.confirm('Delete this lesson? This will remove the video from storage.');
      if (!confirmed) {
        return;
      }
      setDeleteError(null);
      setDeletingLessonId(lessonId);
      try {
        await apiFetch(buildLessonDeletePath(lessonId), {
          method: 'DELETE',
        });
        await loadLessons();
      } catch (error) {
        setDeleteError(error.message || 'Failed to delete lesson.');
      } finally {
        setDeletingLessonId(null);
      }
    },
    [buildLessonDeletePath, loadLessons],
  );

  const columns = React.useMemo(
    () => [
      {
        header: 'Lesson',
        accessorKey: 'title',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">
              Lesson {row.original.lessonNumber ?? '-'}: {row.original.title}
            </p>
            {row.original.description ? (
              <p className="text-xs text-muted-foreground">{row.original.description}</p>
            ) : null}
          </div>
        ),
      },
      {
        header: 'Course',
        accessorKey: 'courseId',
        cell: ({ row }) =>
          courseLookup.get(String(row.original.courseId))?.title ?? 'Unknown course',
      },
      {
        header: 'Video',
        accessorKey: 'videoFilename',
        cell: ({ row }) => (
          <div className="space-y-1 text-xs">
            <span>{row.original.videoFilename ?? '-'}</span>
            {row.original.sizeMB ? (
              <span className="text-muted-foreground">{row.original.sizeMB} MB</span>
            ) : null}
          </div>
        ),
      },
      {
        header: 'Duration',
        accessorKey: 'durationSeconds',
        cell: ({ row }) => {
          const label = formatDurationLabel(row.original.durationSeconds);
          return label ? <span>{label}</span> : <span className="text-muted-foreground">-</span>;
        },
      },
      {
        header: 'Uploaded',
        accessorKey: 'uploadedAt',
        cell: ({ row }) => {
          const value = row.original.uploadedAt;
          if (!value) {
            return '-';
          }
          const parsed = new Date(value);
          return Number.isNaN(parsed.getTime()) ? '-' : parsed.toLocaleString();
        },
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteLesson(row.original.id)}
            disabled={deletingLessonId === row.original.id}
          >
            {deletingLessonId === row.original.id ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        ),
      },
    ],
    [courseLookup, handleDeleteLesson, deletingLessonId],
  );

  const detectVideoDuration = React.useCallback((file) => {
    if (!file) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const objectUrl = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(Number.isFinite(video.duration) ? video.duration : null);
      };
      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };
      video.src = objectUrl;
    });
  }, []);

  const handleLessonFieldChange = (index, field, value) => {
    setLessonDrafts((previous) => {
      const next = previous.map((draft, currentIndex) =>
        currentIndex === index ? { ...draft, [field]: value } : draft,
      );
      return next;
    });

    if (field === 'file') {
      if (value instanceof File) {
        detectVideoDuration(value).then((seconds) => {
          setLessonDrafts((prev) =>
            prev.map((draft, currentIndex) =>
              currentIndex === index
                ? {
                    ...draft,
                    durationSeconds:
                      Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : null,
                  }
                : draft,
            ),
          );
        });
      } else {
        setLessonDrafts((prev) =>
          prev.map((draft, currentIndex) =>
            currentIndex === index ? { ...draft, durationSeconds: null } : draft,
          ),
        );
      }
    }
  };

  const handleLessonNumberChange = (index, value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return;
    }
    const clamped = Math.min(Math.max(parsed, 1), MAX_LESSONS);
    handleLessonFieldChange(index, 'lessonNumber', clamped);
  };

  const updateDraftStatus = (index, updates, recalcProgress = false) => {
    setLessonDrafts((previous) => {
      const next = previous.map((draft, currentIndex) =>
        currentIndex === index ? { ...draft, ...updates } : draft,
      );
      if (recalcProgress) {
        setOverallProgress(computeOverallProgress(next));
      }
      return next;
    });
  };

  const handleTotalLessonsChange = (event) => {
    const { value } = event.target;

    if (value === '') {
      setTotalLessonsInput('');
      return;
    }

    if (!/^\d+$/.test(value)) {
      return;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return;
    }

    const clamped = Math.min(Math.max(parsed, 1), MAX_LESSONS);
    setTotalLessons(clamped);
    setTotalLessonsInput(String(clamped));
  };

  const handleTotalLessonsBlur = () => {
    if (totalLessonsInput === '') {
      setTotalLessonsInput(String(totalLessons));
    }
  };

  const buildLessonsApiUrl = React.useCallback((courseId, path) => {
    const params = new URLSearchParams();
    if (courseId) {
      params.set('courseId', courseId);
    }
    if (BUSINESS_NAME) {
      params.set('businessName', BUSINESS_NAME);
    }
    const query = params.toString();
    return `${API_BASE_URL}/api/lessons${path}${query ? `?${query}` : ''}`;
  }, []);

  const uploadLessonLegacy = React.useCallback(
    (courseId, draft, index) =>
      new Promise((resolve, reject) => {
        const url = buildLessonsApiUrl(courseId, '');
        const formData = new FormData();
        formData.append('lessonNumber', String(draft.lessonNumber));
        formData.append('title', draft.title);
        formData.append('description', draft.description);
        if (Number.isFinite(draft.durationSeconds) && draft.durationSeconds > 0) {
          formData.append('durationSeconds', String(draft.durationSeconds));
        }
        formData.append('video', draft.file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.responseType = 'json';

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) {
            return;
          }
          const percent = Math.round((event.loaded / event.total) * 100);
          updateDraftStatus(index, { progress: percent, status: 'uploading' }, true);
        };

        xhr.onerror = () => {
          reject(new Error('Network error while uploading lesson.'));
        };

        xhr.onload = () => {
          const { status } = xhr;
          const response = xhr.response || {};
          if (status >= 200 && status < 300) {
            resolve(response);
          } else {
            const message =
              (response && (response.error || response.message)) ||
              xhr.statusText ||
              'Failed to upload lesson.';
            reject(new Error(message));
          }
        };

        xhr.send(formData);
      }),
    [buildLessonsApiUrl, updateDraftStatus],
  );

  const uploadLesson = React.useCallback(
    async (courseId, draft, index) => {
      if (!directUploadSupportedRef.current) {
        return uploadLessonLegacy(courseId, draft, index);
      }

      let session = null;
      try {
        const initResponse = await apiFetch(buildLessonsApiUrl(courseId, '/uploads/direct/initiate'), {
          method: 'POST',
          body: JSON.stringify({
            fileName: draft.file.name,
            contentType: draft.file.type || 'application/octet-stream',
            fileSize: draft.file.size,
          }),
        });
        session = initResponse?.data || initResponse;
        if (!session?.uploadId || !session?.key) {
          throw new Error('Unable to initiate upload.');
        }

        const partSize = session.partSizeBytes || DIRECT_UPLOAD_DEFAULT_PART_SIZE;
        const totalBytes = draft.file.size;
        const totalParts = Math.max(1, Math.ceil(totalBytes / partSize));
        const parts = [];
        let uploadedBytes = 0;

        for (let partNumber = 1; partNumber <= totalParts; partNumber += 1) {
          const start = (partNumber - 1) * partSize;
          const end = Math.min(start + partSize, totalBytes);
          const blob = draft.file.slice(start, end);

          const partUrlResponse = await apiFetch(
            buildLessonsApiUrl(courseId, '/uploads/direct/part-url'),
            {
              method: 'POST',
              body: JSON.stringify({
                uploadId: session.uploadId,
                key: session.key,
                partNumber,
              }),
            },
          );
          const partUrlPayload = partUrlResponse?.data || partUrlResponse;
          if (!partUrlPayload?.url) {
            throw new Error('Failed to obtain upload URL.');
          }

          const uploadResponse = await fetch(partUrlPayload.url, {
            method: 'PUT',
            headers: {
              'Content-Type': draft.file.type || 'application/octet-stream',
            },
            body: blob,
          });
          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload part ${partNumber}.`);
          }
          const rawEtag = uploadResponse.headers.get('etag');
          if (!rawEtag) {
            throw new Error(`Upload part ${partNumber} missing ETag.`);
          }
          const eTag = rawEtag.replace(/"/g, '');
          parts.push({ ETag: eTag, PartNumber: partNumber });
          uploadedBytes += blob.size;
          const percent = Math.round((uploadedBytes / totalBytes) * 100);
          updateDraftStatus(index, { progress: percent, status: 'uploading' }, true);
        }

        await apiFetch(buildLessonsApiUrl(courseId, '/uploads/direct/complete'), {
          method: 'POST',
          body: JSON.stringify({
            uploadId: session.uploadId,
            key: session.key,
            parts,
          }),
        });

        const finalizeResponse = await apiFetch(buildLessonsApiUrl(courseId, '/direct'), {
          method: 'POST',
          body: JSON.stringify({
            lessonNumber: draft.lessonNumber,
            title: draft.title,
            description: draft.description,
            durationSeconds: draft.durationSeconds,
            videoStorageKey: session.key,
            videoFilename: session.filename || draft.file.name,
            mimeType: draft.file.type || 'video/mp4',
            sizeBytes: draft.file.size,
          }),
        });

        return finalizeResponse;
      } catch (error) {
        if (session?.uploadId && session?.key) {
          await apiFetch(buildLessonsApiUrl(courseId, '/uploads/direct/abort'), {
            method: 'POST',
            body: JSON.stringify({
              uploadId: session.uploadId,
              key: session.key,
            }),
          }).catch(() => {});
        }
        const normalizedMessage = (error?.message || '').toLowerCase();
        if (
          normalizedMessage.includes('direct uploads require') ||
          normalizedMessage.includes('lessons_s3_bucket')
        ) {
          directUploadSupportedRef.current = false;
          return uploadLessonLegacy(courseId, draft, index);
        }
        throw error;
      }
    },
    [buildLessonsApiUrl, updateDraftStatus, uploadLessonLegacy],
  );

  const handleUploadLessons = async (event) => {
    event.preventDefault();
    setUploadError(null);
    setUploadSuccess(false);

    if (!selectedCourseId) {
      setUploadError('Select a course before uploading lessons.');
      return;
    }

    const missingFields = lessonDrafts.find(
      (draft) =>
        !draft.title.trim() || !draft.description.trim() || !(draft.file instanceof File),
    );
    if (missingFields) {
      setUploadError('Provide a title, description, and video file for each lesson.');
      return;
    }

    setIsUploading(true);
    setOverallProgress(0);
    setLessonDrafts((previous) =>
      previous.map((draft) => ({
        ...draft,
        progress: 0,
        status: 'pending',
        error: null,
      })),
    );

    let encounteredError = false;
    for (let index = 0; index < lessonDrafts.length; index += 1) {
      const draft = lessonDrafts[index];
      try {
        updateDraftStatus(index, { status: 'uploading', error: null });
        const response = await uploadLesson(selectedCourseId, draft, index);
        if (response?.data) {
          updateDraftStatus(
            index,
            {
              progress: 100,
              status: 'success',
              file: null,
            },
            true,
          );
        } else {
          updateDraftStatus(index, { progress: 100, status: 'success', file: null }, true);
        }
      } catch (error) {
        encounteredError = true;
        updateDraftStatus(
          index,
          {
            status: 'error',
            error: error.message || 'Failed to upload lesson.',
            progress: 0,
          },
          true,
        );
      }
    }

    setIsUploading(false);
    await loadLessons();

    if (!encounteredError) {
      setUploadSuccess(true);
      setTimeout(() => {
        setOpen(false);
      }, 1200);
    }
  };

  const renderLessonsTable = (selected) => {
    const assets =
      selected === 'all'
        ? lessons
        : lessons.filter((lesson) => String(lesson.courseId) === String(selected));

    return (
      <div className="rounded-lg border bg-card p-4">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h2 className="text-lg font-semibold">Lessons</h2>
            <p className="text-sm text-muted-foreground">
              {assets.length} {assets.length === 1 ? 'lesson' : 'lessons'} stored for this view.
            </p>
          </div>
          <Badge variant="secondary">{lessons.length} total</Badge>
        </header>
        {deleteError ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <span>{deleteError}</span>
            <Button variant="outline" size="sm" onClick={() => setDeleteError(null)}>
              Dismiss
            </Button>
          </div>
        ) : null}
        {lessonsError ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <span>{lessonsError}</span>
            <Button variant="outline" size="sm" onClick={loadLessons} disabled={lessonsLoading}>
              Retry
            </Button>
          </div>
        ) : null}
        {lessonsLoading ? (
          <div className="flex h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading lessons...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={assets}
            searchPlaceholder="Search lessons"
            className="mt-4"
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lesson library"
        description="Upload lesson videos and track delivery for each course."
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Upload lessons
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto top-[5vh] sm:top-[8vh] translate-y-0 items-start lg:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Batch upload lessons</DialogTitle>
              <DialogDescription>
                Select a course, define how many lessons to upload, then attach each video. Progress
                updates show as files transfer to the server.
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-6" onSubmit={handleUploadLessons}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course</label>
                  <Select
                    value={selectedCourseId}
                    onValueChange={setSelectedCourseId}
                    disabled={coursesLoading || !courses.length || isUploading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={coursesLoading ? 'Loading courses...' : 'Select'} />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {coursesError ? (
                    <p className="text-xs text-destructive">{coursesError}</p>
                  ) : null}
                  {!coursesLoading && !courses.length ? (
                    <p className="text-xs text-muted-foreground">
                      No courses available. Create a course first.
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of lessons</label>
                  <Input
                    type="number"
                    min={1}
                    max={MAX_LESSONS}
                    value={totalLessonsInput}
                    onChange={handleTotalLessonsChange}
                    onBlur={handleTotalLessonsBlur}
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload up to {MAX_LESSONS} lessons in one batch.
                  </p>
                </div>
              </div>

              {lessonDrafts.map((draft, index) => (
                <div key={draft.lessonNumber} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Lesson {draft.lessonNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        Provide lesson details and attach the video.
                      </p>
                    </div>
                    {draft.status === 'success' ? (
                      <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Uploaded
                      </Badge>
                    ) : null}
                    {draft.status === 'error' ? (
                      <Badge variant="destructive">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Failed
                      </Badge>
                    ) : null}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lesson number</label>
                      <Input
                        type="number"
                        min={1}
                        max={MAX_LESSONS}
                        value={draft.lessonNumber ?? index + 1}
                        onChange={(event) => handleLessonNumberChange(index, event.target.value)}
                        disabled={isUploading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Determines lesson order for learners.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        placeholder="e.g. Introduction to components"
                        value={draft.title}
                        onChange={(event) =>
                          handleLessonFieldChange(index, 'title', event.target.value)
                        }
                        disabled={isUploading}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        rows={3}
                        value={draft.description}
                        onChange={(event) =>
                          handleLessonFieldChange(index, 'description', event.target.value)
                        }
                        disabled={isUploading}
                        placeholder="Summarize what learners will cover in this lesson."
                      />
                    </div>
                  <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Lesson video</label>
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          handleLessonFieldChange(index, 'file', file);
                          if (event.target) {
                            // Allow selecting the same file again if needed.
                            // eslint-disable-next-line no-param-reassign
                            event.target.value = '';
                          }
                        }}
                        disabled={isUploading}
                      />
                      <div className="text-xs text-muted-foreground">
                        {draft.file ? (
                          <p>
                            {draft.file.name} ({Math.round(draft.file.size / (1024 * 1024))} MB)
                          </p>
                        ) : draft.status === 'success' ? (
                          <p className="text-emerald-600">Uploaded and stored for learners.</p>
                        ) : (
                          <p>Upload the MP4 or WebM source for this lesson.</p>
                        )}
                        {draft.durationSeconds ? (
                          <p className="mt-1 text-cyan-700">
                            Detected duration: {formatDurationLabel(draft.durationSeconds)}
                          </p>
                        ) : (
                          <p className="mt-1">Duration detected automatically after choosing a video.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Upload progress</span>
                      <span>{draft.progress}%</span>
                    </div>
                    <Progress value={draft.progress} />
                    {draft.error ? (
                      <p className="text-xs text-destructive">{draft.error}</p>
                    ) : null}
                  </div>
                </div>
              ))}

              {uploadError ? (
                <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{uploadError}</span>
                </div>
              ) : null}

              {isUploading ? (
                <div className="space-y-2 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </span>
                    <span>{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} />
                </div>
              ) : null}

              {uploadSuccess && !isUploading ? (
                <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>All lessons uploaded successfully. Closing...</span>
                </div>
              ) : null}

              <DialogFooter>
                <Button type="submit" className="w-full" disabled={isUploading || !courses.length}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CloudUpload className="mr-2 h-4 w-4" />
                      Upload lessons
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Tabs value={courseFilter} onValueChange={setCourseFilter} className="w-full">
        <TabsList className="flex-wrap justify-start bg-muted">
          <TabsTrigger value="all">All courses</TabsTrigger>
          {courses.map((course) => (
            <TabsTrigger key={course.id} value={String(course.id)}>
              {course.title}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all">{renderLessonsTable('all')}</TabsContent>
        {courses.map((course) => (
          <TabsContent key={course.id} value={String(course.id)}>
            {renderLessonsTable(String(course.id))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
