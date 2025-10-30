import * as React from 'react';
import { AlertCircle, CheckCircle2, CloudUpload, Loader2, Plus } from 'lucide-react';

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

const MAX_LESSONS = 50;

function makeLessonDraft(position) {
  return {
    lessonNumber: position,
    title: '',
    description: '',
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
        lessonNumber: index + 1,
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

  const querySuffix = React.useMemo(() => {
    const params = new URLSearchParams();
    if (BUSINESS_NAME) {
      params.set('businessName', BUSINESS_NAME);
    }
    const query = params.toString();
    return query ? `?${query}` : '';
  }, []);

  const loadCourses = React.useCallback(async () => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const response = await apiFetch(`/api/courses${querySuffix}`);
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
  }, [querySuffix]);

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
    ],
    [courseLookup],
  );

  const handleLessonFieldChange = (index, field, value) => {
    setLessonDrafts((previous) => {
      const next = previous.map((draft, currentIndex) =>
        currentIndex === index ? { ...draft, [field]: value } : draft,
      );
      return next;
    });
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

  const buildLessonUploadUrl = React.useCallback(
    (courseId) => {
      const params = new URLSearchParams();
      params.set('courseId', courseId);
      if (BUSINESS_NAME) {
        params.set('businessName', BUSINESS_NAME);
      }
      return `${API_BASE_URL}/api/lessons?${params.toString()}`;
    },
    [],
  );

  const uploadLesson = React.useCallback(
    (courseId, draft, index) =>
      new Promise((resolve, reject) => {
        const url = buildLessonUploadUrl(courseId);
        const formData = new FormData();
        formData.append('lessonNumber', String(draft.lessonNumber));
        formData.append('title', draft.title);
        formData.append('description', draft.description);
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
    [buildLessonUploadUrl],
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
                      {draft.file ? (
                        <p className="text-xs text-muted-foreground">
                          {draft.file.name} ({Math.round(draft.file.size / (1024 * 1024))} MB)
                        </p>
                      ) : draft.status === 'success' ? (
                        <p className="text-xs text-emerald-600">Uploaded and stored for learners.</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Upload the MP4 or WebM source for this lesson.
                        </p>
                      )}
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
