import * as React from 'react';
import { Loader2, MinusCircle, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { apiFetch, BUSINESS_NAME } from '@/config/api';

const MIN_CHOICES = 2;
const MAX_CHOICES = 6;

const questionSchema = z.object({
  courseId: z.string().min(1, 'Select a course'),
  prompt: z.string().min(6, 'Question must be at least 6 characters'),
  explanation: z.string().max(1000).optional(),
});

const createBlankChoice = (isCorrect = false) => ({
  id:
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `choice-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  text: '',
  isCorrect,
});

const resolveCourseId = (course) => {
  if (!course) return null;
  if (course.id !== undefined && course.id !== null) {
    return String(course.id);
  }
  if (course.courseId !== undefined && course.courseId !== null) {
    return String(course.courseId);
  }
  if (course.slug) {
    return String(course.slug);
  }
  return null;
};

const formatDateTime = (value) => {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '--';
  }
  return parsed.toLocaleString();
};

export default function AssessmentsPage() {
  const [courses, setCourses] = React.useState([]);
  const [coursesLoading, setCoursesLoading] = React.useState(false);
  const [coursesError, setCoursesError] = React.useState(null);
  const [questions, setQuestions] = React.useState([]);
  const [questionsLoading, setQuestionsLoading] = React.useState(true);
  const [questionsError, setQuestionsError] = React.useState(null);
  const [filterCourseId, setFilterCourseId] = React.useState('all');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [choiceList, setChoiceList] = React.useState(() => [
    createBlankChoice(true),
    createBlankChoice(false),
  ]);
  const [choiceError, setChoiceError] = React.useState(null);
  const [actionError, setActionError] = React.useState(null);
  const [savingQuestion, setSavingQuestion] = React.useState(false);
  const [deleteInFlight, setDeleteInFlight] = React.useState(null);

  const form = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      courseId: '',
      prompt: '',
      explanation: '',
    },
  });

  const buildApiPath = React.useCallback((path, params = {}) => {
    const searchParams = new URLSearchParams();
    if (BUSINESS_NAME) {
      searchParams.set('businessName', BUSINESS_NAME);
    }
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      searchParams.set(key, value);
    });
    const query = searchParams.toString();
    return query ? `${path}?${query}` : path;
  }, []);

  const loadCourses = React.useCallback(async () => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const response = await apiFetch(buildApiPath('/api/courses', { status: 'all' }));
      const payload = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setCourses(payload);
      const firstCourseId = payload.length ? resolveCourseId(payload[0]) : null;
      if (firstCourseId && !form.getValues('courseId')) {
        form.setValue('courseId', firstCourseId);
      }
    } catch (error) {
      setCoursesError(error.message || 'Failed to load courses from the server.');
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, [buildApiPath, form]);

  const loadQuestions = React.useCallback(async () => {
    setQuestionsLoading(true);
    setQuestionsError(null);
    try {
      const response = await apiFetch(buildApiPath('/api/assessments/questions'));
      const payload = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setQuestions(payload);
    } catch (error) {
      setQuestionsError(error.message || 'Failed to load assessment questions.');
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  }, [buildApiPath]);

  React.useEffect(() => {
    loadCourses();
    loadQuestions();
  }, [loadCourses, loadQuestions]);

  React.useEffect(() => {
    if (!courses.length) {
      return;
    }
    const current = form.getValues('courseId');
    if (current) {
      return;
    }
    const first = resolveCourseId(courses[0]);
    if (first) {
      form.setValue('courseId', first);
    }
  }, [courses, form]);


  React.useEffect(() => {
    if (!dialogOpen) {
      setChoiceError(null);
      setChoiceList([createBlankChoice(true), createBlankChoice(false)]);
      const currentCourseId =
        form.getValues('courseId') || resolveCourseId(courses[0]) || '';
      form.reset({
        courseId: currentCourseId || '',
        prompt: '',
        explanation: '',
      });
    }
  }, [dialogOpen, form, courses]);

  const courseLookup = React.useMemo(() => {
    const map = new Map();
    courses.forEach((course) => {
      const key = resolveCourseId(course);
      if (key) {
        map.set(key, course);
      }
    });
    return map;
  }, [courses]);

  const questionCountByCourse = React.useMemo(() => {
    const counts = new Map();
    questions.forEach((question) => {
      const key = String(question.courseId);
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [questions]);

  const filteredQuestions = React.useMemo(() => {
    if (filterCourseId === 'all') {
      return questions;
    }
    return questions.filter((question) => String(question.courseId) === filterCourseId);
  }, [questions, filterCourseId]);

  const tableRows = React.useMemo(
    () =>
      filteredQuestions.map((question) => ({
        ...question,
        courseTitle: courseLookup.get(String(question.courseId))?.title ?? 'Untitled course',
      })),
    [filteredQuestions, courseLookup],
  );

  const totalChoices = React.useMemo(
    () =>
      questions.reduce(
        (sum, question) => sum + (Array.isArray(question.choices) ? question.choices.length : 0),
        0,
      ),
    [questions],
  );

  const avgChoices = questions.length ? (totalChoices / questions.length).toFixed(1) : '0.0';
  const coursesWithCoverage = questionCountByCourse.size;
  const coveragePercent =
    courses.length > 0 ? Math.round((coursesWithCoverage / courses.length) * 100) : 0;
  const latestUpdated = questions
    .map((question) => question.updatedAt || question.createdAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0];

  const courseOptions = React.useMemo(
    () =>
      courses
        .map((course) => {
          const id = resolveCourseId(course);
          if (!id) {
            return null;
          }
          return {
            id,
            title: course.title ?? course.name ?? 'Untitled course',
          };
        })
        .filter(Boolean),
    [courses],
  );

  React.useEffect(() => {
    if (!courseOptions.length) {
      return;
    }
    const current = form.getValues('courseId');
    const exists = courseOptions.some((course) => course.id === current);
    if (!exists) {
      form.setValue('courseId', courseOptions[0].id);
    }
  }, [courseOptions, form]);

  const handleChoiceTextChange = React.useCallback((choiceId, value) => {
    setChoiceList((previous) =>
      previous.map((choice) => (choice.id === choiceId ? { ...choice, text: value } : choice)),
    );
  }, []);

  const handleAddChoice = React.useCallback(() => {
    setChoiceList((previous) => {
      if (previous.length >= MAX_CHOICES) {
        return previous;
      }
      return [...previous, createBlankChoice(false)];
    });
  }, []);

  const handleRemoveChoice = React.useCallback((choiceId) => {
    setChoiceList((previous) => {
      if (previous.length <= MIN_CHOICES) {
        return previous;
      }
      return previous.filter((choice) => choice.id !== choiceId);
    });
  }, []);

  const handleMarkCorrect = React.useCallback((choiceId) => {
    setChoiceList((previous) =>
      previous.map((choice) => ({ ...choice, isCorrect: choice.id === choiceId })),
    );
  }, []);

  const validateChoiceList = React.useCallback(() => {
    const trimmed = choiceList
      .map((choice) => ({
        ...choice,
        text: choice.text.trim(),
      }))
      .filter((choice) => choice.text);

    if (trimmed.length < MIN_CHOICES) {
      setChoiceError('Add at least two answer options.');
      return null;
    }
    if (!trimmed.some((choice) => choice.isCorrect)) {
      setChoiceError('Select the correct answer.');
      return null;
    }
    setChoiceError(null);
    return trimmed;
  }, [choiceList]);

  const onSubmit = async (values) => {
    const validChoices = validateChoiceList();
    if (!validChoices) {
      return;
    }
    setSavingQuestion(true);
    setActionError(null);
    try {
      const payload = {
        businessName: BUSINESS_NAME,
        courseId: values.courseId,
        prompt: values.prompt,
        explanation: values.explanation,
        choices: validChoices.map((choice) => ({
          id: choice.id,
          text: choice.text,
          isCorrect: choice.isCorrect,
        })),
      };
      const response = await apiFetch('/api/assessments/questions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const created =
        response && typeof response === 'object'
          ? response.data && typeof response.data === 'object'
            ? response.data
            : response
          : null;
      if (created) {
        setQuestions((previous) => [created, ...previous]);
      } else {
        await loadQuestions();
      }
      setDialogOpen(false);
    } catch (error) {
      setActionError(error.message || 'Unable to create question.');
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = React.useCallback(
    async (question) => {
      if (!question?.id) {
        return;
      }
      setDeleteInFlight(question.id);
      setActionError(null);
      try {
        await apiFetch(buildApiPath(`/api/assessments/questions/${question.id}`), {
          method: 'DELETE',
        });
        setQuestions((previous) => previous.filter((item) => item.id !== question.id));
      } catch (error) {
        setActionError(error.message || 'Unable to delete question.');
      } finally {
        setDeleteInFlight(null);
      }
    },
    [buildApiPath],
  );

  const columns = React.useMemo(
    () => [
      {
        header: 'Course',
        accessorKey: 'courseTitle',
      },
      {
        header: 'Question',
        accessorKey: 'prompt',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.prompt}</p>
            {row.original.explanation ? (
              <p className="text-xs text-muted-foreground">{row.original.explanation}</p>
            ) : null}
          </div>
        ),
      },
      {
        header: 'Correct answer',
        accessorKey: 'correctChoiceId',
        cell: ({ row }) => {
          const answer =
            row.original.choices?.find(
              (choice) => choice.id === row.original.correctChoiceId || choice.isCorrect,
            ) || null;
          return (
            <div>
              <p className="font-medium">{answer ? answer.text : '--'}</p>
              <p className="text-xs text-muted-foreground">
                {row.original.choices?.length || 0} options
              </p>
            </div>
          );
        },
      },
      {
        header: 'Updated',
        accessorKey: 'updatedAt',
        cell: ({ row }) => formatDateTime(row.original.updatedAt || row.original.createdAt),
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteQuestion(row.original)}
            disabled={deleteInFlight === row.original.id}
          >
            {deleteInFlight === row.original.id ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Removing
              </>
            ) : (
              <>
                <Trash2 className="mr-1 h-4 w-4" />
                Remove
              </>
            )}
          </Button>
        ),
      },
    ],
    [handleDeleteQuestion, deleteInFlight],
  );

  const canCreateQuestion = Boolean(BUSINESS_NAME && courseOptions.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments"
        description="Create multiple choice banks per course and keep attempts consistent."
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" disabled={!canCreateQuestion}>
              <Plus className="h-4 w-4" /> New question
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a multiple choice question</DialogTitle>
              <DialogDescription>
                Choose a course, type your prompt, and add answer options.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={
                          courseOptions.some((course) => course.id === field.value)
                            ? field.value
                            : undefined
                        }
                        disabled={!courseOptions.length}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courseOptions.length ? (
                            courseOptions.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.title}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No courses available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question prompt</FormLabel>
                      <FormControl>
                        <Input placeholder="What is the first hook introduced in React?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Explanation (optional)</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Add guidance shown after the learner answers.(Optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Answer choices</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={handleAddChoice}
                      disabled={choiceList.length >= MAX_CHOICES}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add option
                    </Button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {choiceList.map((choice, index) => (
                      <div key={choice.id} className="flex items-start gap-3 rounded-xl border p-3">
                        <button
                          type="button"
                          className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border ${
                            choice.isCorrect
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-muted text-muted-foreground'
                          }`}
                          onClick={() => handleMarkCorrect(choice.id)}
                          aria-label={choice.isCorrect ? 'Correct answer' : 'Mark as correct'}
                        >
                          {choice.isCorrect ? '✓' : index + 1}
                        </button>
                        <div className="flex-1">
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={choice.text}
                            onChange={(event) => handleChoiceTextChange(choice.id, event.target.value)}
                          />
                        </div>
                        {choiceList.length > MIN_CHOICES ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveChoice(choice.id)}
                            aria-label="Remove option"
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  {choiceError ? <p className="mt-2 text-sm text-destructive">{choiceError}</p> : null}
                </div>
                {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={savingQuestion || !canCreateQuestion}>
                    {savingQuestion ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving question...
                      </>
                    ) : (
                      'Save question'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Questions created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{questions.length}</div>
            <CardDescription>Total multiple choice questions available.</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Course coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{coveragePercent}%</div>
            <CardDescription>
              {coursesWithCoverage} of {courses.length || 0} courses have a question bank.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Average options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{avgChoices}</div>
            <CardDescription>Choices per question across the bank.</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Last update</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{latestUpdated ? formatDateTime(latestUpdated) : '--'}</div>
            <CardDescription>Most recent edit across all questions.</CardDescription>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Course coverage</CardTitle>
            <CardDescription>Click a course to filter questions for that curriculum.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[200px]">
              <Select value={filterCourseId} onValueChange={setFilterCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All courses</SelectItem>
                  {courseOptions.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={loadQuestions}
              disabled={questionsLoading}
              title="Refresh questions"
            >
              {questionsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {courseOptions.length ? (
            courseOptions.map((course) => {
              const count = questionCountByCourse.get(course.id) || 0;
              const isActive = filterCourseId === course.id;
              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => setFilterCourseId(isActive ? 'all' : course.id)}
                  className={`rounded-xl border p-4 text-left transition hover:border-primary ${
                    isActive ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <p className="font-semibold">{course.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {count} {count === 1 ? 'question' : 'questions'}
                  </p>
                  <Badge variant={count ? 'secondary' : 'outline'} className="mt-3">
                    {count ? 'Ready for learners' : 'Needs questions'}
                  </Badge>
                </button>
              );
            })
          ) : (
            <div className="col-span-full rounded-xl border border-dashed bg-muted/50 p-6 text-sm text-muted-foreground">
              Create a course first to start attaching assessment questions.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Question bank</CardTitle>
          <CardDescription>Manage, filter and export individual questions.</CardDescription>
        </CardHeader>
        <CardContent>
          {questionsError ? (
            <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <div className="flex items-center justify-between gap-3">
                <span>{questionsError}</span>
                <Button size="sm" variant="outline" onClick={loadQuestions} disabled={questionsLoading}>
                  Retry
                </Button>
              </div>
            </div>
          ) : null}
          {actionError && !questionsError ? (
            <p className="mb-3 text-sm text-destructive">{actionError}</p>
          ) : null}
          {questionsLoading && !tableRows.length ? (
            <div className="flex h-40 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading question bank…
            </div>
          ) : (
            <>
              <DataTable columns={columns} data={tableRows} searchPlaceholder="Search question text" />
              {!questionsLoading && !tableRows.length ? (
                <p className="mt-3 text-center text-sm text-muted-foreground">
                  {questions.length
                    ? 'No questions match the current course filter.'
                    : 'No questions yet. Use “New question” to seed your bank.'}
                </p>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
