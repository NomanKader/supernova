import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Layers, Users, PlayCircle, CheckCircle2, ClipboardList } from "lucide-react";
import { apiFetch, BUSINESS_NAME } from "@/config/api";
import { buildAssetUrl, formatPriceLabel, formatDurationLabel } from "@/utils/course";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/marketing/auth-context";
import supernovaLogo from "@/assets/logo.jpg";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const FALLBACK_COURSE = {
  title: "Course not found",
  description:
    "We couldn't locate this course. It may have been unpublished or moved. Please return to the catalog to explore other learning paths.",
  price: 0,
  level: "Beginner",
};
const PASS_THRESHOLD = 75;

function splitDescription(text) {
  if (!text) {
    return [];
  }
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function resolveLessonIdentifier(lesson) {
  if (!lesson) {
    return null;
  }
  const candidates = [
    lesson.id,
    lesson.lessonId,
    lesson.videoFilename,
    lesson.assetUrl,
    `${lesson.lessonNumber || ""}-${lesson.title || ""}`,
  ];
  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const normalized = String(candidate).trim();
    if (normalized) {
      return normalized;
    }
  }
  return null;
}

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [course, setCourse] = React.useState(null);
  const [lessons, setLessons] = React.useState([]);
  const [categories, setCategories] = React.useState(new Map());
  const [courseLoading, setCourseLoading] = React.useState(true);
  const [lessonsLoading, setLessonsLoading] = React.useState(true);
  const [courseError, setCourseError] = React.useState(null);
  const [lessonsError, setLessonsError] = React.useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = React.useState(null);
  const [enrollmentNotes, setEnrollmentNotes] = React.useState('');
  const [enrollmentLoading, setEnrollmentLoading] = React.useState(false);
  const [enrollmentError, setEnrollmentError] = React.useState('');
  const [activeLesson, setActiveLesson] = React.useState(null);
  const [isLessonPlayerOpen, setLessonPlayerOpen] = React.useState(false);
  const [lessonProgress, setLessonProgress] = React.useState([]);
  const [progressLoading, setProgressLoading] = React.useState(false);
  const [progressError, setProgressError] = React.useState('');
  const [progressSaving, setProgressSaving] = React.useState(null);
  const [assessmentQuestions, setAssessmentQuestions] = React.useState([]);
  const [assessmentLoading, setAssessmentLoading] = React.useState(false);
  const [assessmentError, setAssessmentError] = React.useState('');
  const [assessmentDialogOpen, setAssessmentDialogOpen] = React.useState(false);
  const [selectedAnswers, setSelectedAnswers] = React.useState({});
  const [assessmentSubmitting, setAssessmentSubmitting] = React.useState(false);
  const [assessmentSubmitError, setAssessmentSubmitError] = React.useState('');
  const [assessmentNotice, setAssessmentNotice] = React.useState('');
  const [attempts, setAttempts] = React.useState([]);
  const [attemptsLoading, setAttemptsLoading] = React.useState(false);
  const videoRef = React.useRef(null);
  const maxWatchedRef = React.useRef(0);
  const [certificateGenerating, setCertificateGenerating] = React.useState(false);
  const [certificateError, setCertificateError] = React.useState('');
  const activeLessonVideoUrl = React.useMemo(() => {
    if (!activeLesson) {
      return null;
    }
    return buildAssetUrl(
      activeLesson.resolvedVideoUrl ||
        activeLesson.videoUrl ||
        activeLesson.assetUrl ||
        activeLesson.videoURL ||
        activeLesson.assetURL ||
        '',
    );
  }, [activeLesson]);

  const openLessonPlayer = React.useCallback(
    (lesson, resolvedVideoUrl) => {
      if (!lesson || !resolvedVideoUrl) {
        return;
      }
      setActiveLesson((previous) => {
        const nextIdentifier = resolveLessonIdentifier(lesson);
        const previousIdentifier = resolveLessonIdentifier(previous);
        if (
          previous &&
          previousIdentifier &&
          nextIdentifier &&
          previousIdentifier === nextIdentifier &&
          previous.resolvedVideoUrl === resolvedVideoUrl
        ) {
          return previous;
        }
        return { ...lesson, resolvedVideoUrl };
      });
      setLessonPlayerOpen(true);
    },
    [],
  );

  const querySuffix = React.useMemo(() => {
    const params = new URLSearchParams();
    if (BUSINESS_NAME) {
      params.set("businessName", BUSINESS_NAME);
    }
    return params.toString();
  }, []);

  const coursesEndpoint = React.useMemo(() => {
    const params = new URLSearchParams();
    if (BUSINESS_NAME) {
      params.set("businessName", BUSINESS_NAME);
    }
    params.set("status", "all");
    const query = params.toString();
    return `/api/courses${query ? `?${query}` : ""}`;
  }, []);

  const categoriesEndpoint = React.useMemo(() => {
    const params = new URLSearchParams();
    if (BUSINESS_NAME) {
      params.set("businessName", BUSINESS_NAME);
    }
    const query = params.toString();
    return `/api/course-categories${query ? `?${query}` : ""}`;
  }, []);

  const lessonsEndpoint = React.useMemo(() => {
    if (!courseId) {
      return null;
    }
    const params = new URLSearchParams();
    if (BUSINESS_NAME) {
      params.set("businessName", BUSINESS_NAME);
    }
    params.set("courseId", courseId);
    return `/api/lessons?${params.toString()}`;
  }, [courseId]);

  const buildLearnerParams = React.useCallback(
    (extra = {}) => {
      const params = new URLSearchParams();
      if (BUSINESS_NAME) {
        params.set("businessName", BUSINESS_NAME);
      }
      if (user?.email) {
        params.set("learnerEmail", user.email);
      }
      if (user?.id !== undefined && user?.id !== null) {
        params.set("userId", user.id);
      }
      Object.entries(extra).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          return;
        }
        params.set(key, value);
      });
      return params;
    },
    [user?.email, user?.id],
  );

  React.useEffect(() => {
    let isMounted = true;
    setCourseLoading(true);
    setCourseError(null);

    async function loadCourse() {
      try {
        const response = await apiFetch(coursesEndpoint);
        const payload = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        const found = payload.find((entry) => String(entry.id) === String(courseId));
        if (isMounted) {
          setCourse(found || null);
          if (!found) {
            setCourseError("We couldn't find that course.");
          }
        }
      } catch (error) {
        if (isMounted) {
          setCourseError(error.message || "Unable to load course details.");
          setCourse(null);
        }
      } finally {
        if (isMounted) {
          setCourseLoading(false);
        }
      }
    }

    loadCourse();
    return () => {
      isMounted = false;
    };
  }, [courseId, coursesEndpoint]);

  React.useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const response = await apiFetch(categoriesEndpoint);
        const normalized = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        if (!isMounted) return;
        const map = new Map();
        normalized.forEach((category) => {
          if (category?.id !== undefined && category?.name) {
            map.set(String(category.id), category.name);
          }
        });
        setCategories(map);
      } catch {
        if (isMounted) {
          setCategories(new Map());
        }
      }
    }

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, [categoriesEndpoint]);

  React.useEffect(() => {
    if (!lessonsEndpoint) {
      return;
    }
    let isMounted = true;
    setLessonsLoading(true);
    setLessonsError(null);

    async function loadLessons() {
      try {
        const response = await apiFetch(lessonsEndpoint);
        const payload = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        if (isMounted) {
          setLessons(payload);
        }
      } catch (error) {
        if (isMounted) {
          setLessonsError(error.message || "Unable to load lessons.");
          setLessons([]);
        }
      } finally {
        if (isMounted) {
          setLessonsLoading(false);
        }
      }
    }

    loadLessons();
    return () => {
      isMounted = false;
    };
  }, [lessonsEndpoint]);

  React.useEffect(() => {
    if (!isAuthenticated || !courseId || (!user?.email && user?.id == null)) {
      setEnrollmentStatus(null);
      setEnrollmentNotes('');
      setEnrollmentError('');
      setEnrollmentLoading(false);
      return undefined;
    }

    let canceled = false;
    setEnrollmentLoading(true);
    setEnrollmentError('');

    const params = new URLSearchParams();
    if (BUSINESS_NAME) {
      params.set('businessName', BUSINESS_NAME);
    }
    if (user?.email) {
      params.set('learnerEmail', user.email);
    }
    if (user?.id !== undefined && user?.id !== null) {
      params.set('userId', user.id);
    }

    const endpoint = `/api/enrollments/manual?${params.toString()}`;

    apiFetch(endpoint)
      .then((response) => {
        if (canceled) return;
        const dataset = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        const record = dataset.find((entry) => String(entry.courseId) === String(courseId));
        setEnrollmentStatus(record?.status || null);
        const note = record?.reviewNotes?.trim() || record?.notes?.trim() || '';
        setEnrollmentNotes(note);
      })
      .catch((error) => {
        if (canceled) return;
        setEnrollmentError(error.message || 'Unable to load your enrollment status.');
        setEnrollmentStatus(null);
        setEnrollmentNotes('');
      })
      .finally(() => {
        if (!canceled) {
          setEnrollmentLoading(false);
        }
      });

    return () => {
      canceled = true;
    };
  }, [isAuthenticated, user?.email, user?.id, courseId]);

  const testerEmail = 'dev.pyaephyoswe@gmail.com';
  const reviewerEmail = 'dev.nksoftwarehouse@gmail.com';
  const normalizedTesterEmail = testerEmail.toLowerCase();
  const normalizedReviewerEmail = reviewerEmail.toLowerCase();
  const isReadOnlyTester =
    isAuthenticated && (user?.email || '').toLowerCase() === normalizedTesterEmail;
  const isInPersonOnlyReviewer =
    isAuthenticated && (user?.email || '').toLowerCase() === normalizedReviewerEmail;
  const checkoutPath = course?.id ? `/checkout/${course.id}` : null;
  const canShowEnrollButton = Boolean(checkoutPath && !isReadOnlyTester && !isInPersonOnlyReviewer);

  const normalizedEnrollmentStatus = enrollmentStatus
    ? String(enrollmentStatus).toLowerCase()
    : null;
  const hasLearnerIdentity = Boolean(
    (user?.email && String(user.email).trim()) ||
      (user?.id !== undefined && user?.id !== null),
  );
  const shouldShowEnrollButton =
    canShowEnrollButton &&
    (!normalizedEnrollmentStatus || normalizedEnrollmentStatus === 'rejected');
  const canStreamLessons = normalizedEnrollmentStatus === 'approved';

  React.useEffect(() => {
    if (!canStreamLessons || !courseId || !hasLearnerIdentity) {
      setLessonProgress([]);
      setProgressError('');
      setProgressLoading(false);
      return;
    }
    let canceled = false;
    setProgressLoading(true);
    setProgressError('');

    const params = buildLearnerParams({ courseId });
    apiFetch(`/api/lessons/progress?${params.toString()}`)
      .then((response) => {
        if (canceled) return;
        const normalized = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setLessonProgress(normalized);
      })
      .catch((error) => {
        if (canceled) return;
        setProgressError(error.message || 'Unable to load your lesson progress.');
        setLessonProgress([]);
      })
      .finally(() => {
        if (!canceled) {
          setProgressLoading(false);
        }
      });

    return () => {
      canceled = true;
    };
  }, [canStreamLessons, courseId, hasLearnerIdentity, buildLearnerParams]);

  React.useEffect(() => {
    if (!courseId || !canStreamLessons) {
      setAssessmentQuestions([]);
      setAssessmentError('');
      setAssessmentLoading(false);
      return;
    }
    let canceled = false;
    setAssessmentLoading(true);
    setAssessmentError('');

    const params = new URLSearchParams();
    if (BUSINESS_NAME) {
      params.set('businessName', BUSINESS_NAME);
    }
    params.set('courseId', courseId);

    apiFetch(`/api/assessments/questions?${params.toString()}`)
      .then((response) => {
        if (canceled) return;
        const payload = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setAssessmentQuestions(payload);
      })
      .catch((error) => {
        if (canceled) return;
        setAssessmentError(error.message || 'Unable to load assessment questions.');
        setAssessmentQuestions([]);
      })
      .finally(() => {
        if (!canceled) {
          setAssessmentLoading(false);
        }
      });

    return () => {
      canceled = true;
    };
  }, [courseId, canStreamLessons]);

  React.useEffect(() => {
    if (!courseId || !canStreamLessons || !hasLearnerIdentity) {
      setAttempts([]);
      setAttemptsLoading(false);
      return;
    }
    let canceled = false;
    setAttemptsLoading(true);

    const params = buildLearnerParams({ courseId });
    apiFetch(`/api/assessments/attempts?${params.toString()}`)
      .then((response) => {
        if (canceled) return;
        const payload = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setAttempts(payload);
      })
      .catch((error) => {
        if (canceled) return;
        setAssessmentError((prev) =>
          prev || error.message || 'Unable to load assessment attempts.',
        );
        setAttempts([]);
      })
      .finally(() => {
        if (!canceled) {
          setAttemptsLoading(false);
        }
      });

    return () => {
      canceled = true;
    };
  }, [courseId, canStreamLessons, hasLearnerIdentity, buildLearnerParams]);

  const resolvedCourse = course || FALLBACK_COURSE;
  const heroImage = resolvedCourse.imageUrl ? buildAssetUrl(resolvedCourse.imageUrl) : null;
  const categoryLabel =
    (resolvedCourse.categoryId && categories.get(String(resolvedCourse.categoryId))) ||
    resolvedCourse.categoryLabel ||
    "Featured course";
  const priceLabel = formatPriceLabel(resolvedCourse.price);
  const lessonCount = lessons.length || resolvedCourse.lessons || 0;
  const fallbackLessonDuration = lessons.reduce(
    (total, lesson) =>
      total +
      (Number.isFinite(lesson?.durationSeconds)
        ? Number(lesson.durationSeconds)
        : Number(lesson?.duration) || 0),
    0,
  );
  const totalDurationSeconds =
    Number.isFinite(resolvedCourse.durationSeconds) && resolvedCourse.durationSeconds > 0
      ? resolvedCourse.durationSeconds
      : fallbackLessonDuration;
  const durationLabel =
    totalDurationSeconds > 0 ? formatDurationLabel(totalDurationSeconds) : `${lessonCount} lessons`;
  const descriptionParagraphs = splitDescription(resolvedCourse.description);
  const statusThemes = {
    pending: {
      label: "Pending verification",
      message: "We are reviewing your manual payment proof.",
      container: "border-amber-300 bg-amber-50 text-amber-800",
    },
    approved: {
      label: "Enrollment active",
      message: "Your access has been unlocked. Jump back in anytime.",
      container: "border-emerald-300 bg-emerald-50 text-emerald-800",
    },
    rejected: {
      label: "Payment rejected",
      message: "Please resubmit with the correct details.",
      container: "border-rose-300 bg-rose-50 text-rose-800",
    },
  };
  const currentStatusTheme =
    normalizedEnrollmentStatus && statusThemes[normalizedEnrollmentStatus]
      ? statusThemes[normalizedEnrollmentStatus]
      : null;
  const progressMap = React.useMemo(() => {
    const map = new Map();
    lessonProgress.forEach((entry) => {
      if (entry?.lessonId) {
        map.set(String(entry.lessonId), entry);
      }
    });
    return map;
  }, [lessonProgress]);
  const completedLessonsCount = progressMap.size;
  const hasCompletedAllLessons =
    lessonCount > 0 && completedLessonsCount >= lessonCount;
  const handleLessonComplete = React.useCallback(
    async (lesson) => {
      if (!canStreamLessons || !courseId || !lesson || !hasLearnerIdentity) {
        return;
      }
      const lessonId = resolveLessonIdentifier(lesson);
      if (!lessonId) {
        return;
      }
      setProgressSaving(lessonId);
      setProgressError("");
      try {
        const payload = {
          businessName: BUSINESS_NAME,
          courseId,
          lessonId,
          lessonTitle: lesson.title,
          userId: user?.id,
          learnerEmail: user?.email,
          durationSeconds: lesson.durationSeconds || lesson.duration || null,
        };
        const response = await apiFetch("/api/lessons/progress", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const record =
          response && typeof response === "object"
            ? response.data && typeof response.data === "object"
              ? response.data
              : response
            : null;
        if (record?.lessonId) {
          setLessonProgress((previous) => {
            const filtered = previous.filter((entry) => String(entry.lessonId) !== String(record.lessonId));
            return [record, ...filtered];
          });
        }
      } catch (error) {
        setProgressError(error.message || "Unable to update lesson progress.");
      } finally {
        setProgressSaving(null);
      }
    },
    [canStreamLessons, courseId, user?.id, user?.email, hasLearnerIdentity],
  );
  const latestAttempt = attempts.length ? attempts[0] : null;
  const latestScorePercent =
    typeof latestAttempt?.scorePercent === 'number' ? Number(latestAttempt.scorePercent) : null;
  const hasAssessmentAttempt = Boolean(latestAttempt);
  const hasPassedAssessment =
    hasAssessmentAttempt && latestScorePercent !== null && latestScorePercent >= PASS_THRESHOLD;
  const isPerfectScore = hasPassedAssessment && latestScorePercent >= 100;
  const shouldShowCertificateButton = hasPassedAssessment;
  const shouldShowRetakeButton = !hasAssessmentAttempt || !isPerfectScore;
  const assessmentReady = canStreamLessons && assessmentQuestions.length > 0;
  const assessmentLockedByLessons = assessmentReady && !hasCompletedAllLessons;
  const allQuestionsAnswered = React.useMemo(() => {
    if (!assessmentQuestions.length) {
      return false;
    }
    return assessmentQuestions.every((question) => {
      const key = question?.id ? String(question.id) : null;
      if (!key) {
        return true;
      }
      const answer = selectedAnswers[key];
      return Boolean(answer);
    });
  }, [assessmentQuestions, selectedAnswers]);

  const handleAssessmentSubmit = React.useCallback(async () => {
    if (!assessmentReady || !courseId || !hasLearnerIdentity) {
      setAssessmentSubmitError("Assessment is unavailable right now.");
      return;
    }
    if (!assessmentQuestions.length) {
      setAssessmentSubmitError("No questions to submit.");
      return;
    }
    if (!allQuestionsAnswered) {
      setAssessmentSubmitError("Please answer every question before submitting.");
      return;
    }
    setAssessmentSubmitting(true);
    setAssessmentSubmitError("");
    try {
      const answersPayload = assessmentQuestions.map((question) => ({
        questionId: question.id,
        choiceId: selectedAnswers[String(question.id)],
      }));
      const payload = {
        businessName: BUSINESS_NAME,
        courseId,
        userId: user?.id,
        learnerEmail: user?.email,
        answers: answersPayload,
      };
      const response = await apiFetch("/api/assessments/attempts", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const attempt =
        response && typeof response === "object"
          ? response.data && typeof response.data === "object"
            ? response.data
            : response
          : null;
      if (attempt) {
        setAttempts((previous) => [attempt, ...previous]);
        setAssessmentDialogOpen(false);
        setSelectedAnswers({});
        const scoreLabel =
          typeof attempt.scorePercent === "number" ? `${Math.round(attempt.scorePercent)}%` : "";
        setAssessmentNotice(scoreLabel ? `Assessment submitted. Score ${scoreLabel}.` : "Assessment submitted.");
        setCertificateError("");
      }
    } catch (error) {
      setAssessmentSubmitError(error.message || "Unable to submit the assessment.");
    } finally {
      setAssessmentSubmitting(false);
    }
  }, [
    assessmentReady,
    courseId,
    hasLearnerIdentity,
    assessmentQuestions,
    selectedAnswers,
    allQuestionsAnswered,
    user?.id,
    user?.email,
  ]);
  const handleSelectAnswer = React.useCallback((questionId, choiceId) => {
    setSelectedAnswers((previous) => ({
      ...previous,
      [String(questionId)]: String(choiceId),
    }));
  }, []);

  const fetchAssetAsDataUrl = React.useCallback(async (assetUrl) => {
    const response = await fetch(assetUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  const handleCertificateDownload = React.useCallback(async () => {
    if (!shouldShowCertificateButton || !latestAttempt || !resolvedCourse) {
      return;
    }
    setCertificateError("");
    setCertificateGenerating(true);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFillColor(245, 248, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      try {
        const logoDataUrl = await fetchAssetAsDataUrl(supernovaLogo);
        doc.addImage(logoDataUrl, "JPEG", 60, 40, 180, 80);
      } catch {
        // ignore logo loading errors
      }

      doc.setFont("times", "bold");
      doc.setFontSize(34);
      doc.text("Certificate of Completion", pageWidth / 2, 130, { align: "center" });

      doc.setFontSize(22);
      doc.setFont("times", "normal");
      doc.text("This is to proudly certify that", pageWidth / 2, 190, { align: "center" });

      const studentName = user?.name || user?.email || "Learner";
      doc.setFont("times", "bold");
      doc.setFontSize(32);
      doc.text(studentName, pageWidth / 2, 240, { align: "center" });

      doc.setFont("times", "normal");
      doc.setFontSize(20);
      doc.text("has completed the course", pageWidth / 2, 280, { align: "center" });

      doc.setFont("times", "bold");
      doc.setFontSize(26);
      doc.text(resolvedCourse.title || "Supernova Course", pageWidth / 2, 325, { align: "center" });

      doc.setFont("times", "normal");
      doc.setFontSize(18);
      const scoreText =
        latestScorePercent !== null
          ? `Final score: ${Math.round(latestScorePercent)}% (${latestAttempt.correctCount}/${latestAttempt.questionCount})`
          : "Final score: --";
      doc.text(scoreText, pageWidth / 2, 365, { align: "center" });

      const issuedAt = new Date().toLocaleString();
      doc.text(`Issued on ${issuedAt}`, pageWidth / 2, 400, { align: "center" });

      doc.setDrawColor(52, 120, 246);
      doc.setLineWidth(2);
      doc.line(140, pageHeight - 120, pageWidth - 140, pageHeight - 120);
      doc.setFontSize(16);
      doc.setFont("times", "italic");
      doc.text("Supernova Learning • Transform your finance, body & mind", pageWidth / 2, pageHeight - 90, {
        align: "center",
      });

      const safeTitle = (resolvedCourse.title || "course").replace(/[^a-z0-9]+/gi, "-");
      doc.save(`supernova-${safeTitle}-certificate.pdf`);
    } catch (error) {
      setCertificateError(error.message || "Unable to generate certificate.");
    } finally {
      setCertificateGenerating(false);
    }
  }, [
    shouldShowCertificateButton,
    latestAttempt,
    resolvedCourse,
    user?.name,
    user?.email,
    latestScorePercent,
    fetchAssetAsDataUrl,
  ]);

  const handleVideoTimeUpdate = React.useCallback((event) => {
    const video = event.currentTarget;
    const current = video.currentTime || 0;
    const allowed = maxWatchedRef.current || 0;
    if (current > allowed + 0.75) {
      video.currentTime = allowed;
      return;
    }
    if (current > allowed) {
      maxWatchedRef.current = current;
    }
  }, []);

  const handleVideoSeeking = React.useCallback((event) => {
    const target = event.currentTarget;
    const allowed = Math.max(maxWatchedRef.current, 0);
    if (target.currentTime > allowed + 0.25) {
      target.currentTime = allowed;
    }
  }, []);

  const handleVideoLoaded = React.useCallback(() => {
    maxWatchedRef.current = 0;
  }, []);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    setActiveLesson(null);
    setLessonPlayerOpen(false);
    setSelectedAnswers({});
    setAssessmentNotice("");
    setAssessmentSubmitError("");
  }, [courseId]);

  React.useEffect(() => {
    maxWatchedRef.current = 0;
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [activeLesson]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="relative overflow-hidden bg-slate-900 text-white">
        {heroImage ? (
          <div className="absolute inset-0">
            <img src={heroImage} alt={resolvedCourse.title} className="h-full w-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-slate-900" />
        )}

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:py-24">
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white backdrop-blur">
            {categoryLabel}
          </Badge>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {resolvedCourse.title}
          </h1>
            <p className="mt-4 max-w-3xl text-base text-slate-100 sm:text-lg">
              {descriptionParagraphs[0] ||
                "Explore this program to understand the curriculum, lesson library, and outcomes before enrolling."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className="text-3xl font-semibold text-white">{priceLabel}</span>
              <p className="text-sm text-slate-100">
                Enrollment is handled during in-person registration. Contact our team if you need assistance.
              </p>
              {currentStatusTheme ? (
                <div
                  className={`inline-flex max-w-sm flex-col rounded-2xl border px-4 py-2 text-left text-sm font-medium ${currentStatusTheme.container}`}
                >
                  <span>{currentStatusTheme.label}</span>
                  <span className="text-xs font-normal">{currentStatusTheme.message}</span>
                  {normalizedEnrollmentStatus === "rejected" && enrollmentNotes ? (
                    <span className="text-xs font-semibold text-rose-700">Reason: {enrollmentNotes}</span>
                  ) : null}
                  {normalizedEnrollmentStatus !== "rejected" && enrollmentNotes ? (
                    <span className="text-xs font-normal">Note: {enrollmentNotes}</span>
                  ) : null}
                </div>
              ) : null}
              {shouldShowEnrollButton ? (
                <Link
                  to={checkoutPath}
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-8 py-3 text-base font-semibold uppercase tracking-wide text-white shadow-xl shadow-blue-900/40 transition hover:scale-105 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200"
                >
                  Enroll now
                </Link>
              ) : null}
            <Link
              to="/courses"
              className="text-sm font-medium text-slate-100 underline-offset-4 hover:underline"
            >
              Browse all courses
            </Link>
              {enrollmentLoading ? (
                <span className="text-xs text-slate-200">Checking enrollment status...</span>
              ) : null}
              {enrollmentError ? (
                <span className="text-xs text-rose-200">{enrollmentError}</span>
              ) : null}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <section className="grid gap-6 rounded-3xl bg-white p-6 shadow-lg md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="h-4 w-4" />
              Duration
            </div>
            <p className="mt-2 text-xl font-semibold text-slate-900">{durationLabel}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Layers className="h-4 w-4" />
              Level
            </div>
            <p className="mt-2 text-xl font-semibold capitalize text-slate-900">
              {resolvedCourse.level || "All levels"}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users className="h-4 w-4" />
              Lessons
            </div>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {lessonCount > 0 ? `${lessonCount} videos` : "Coming soon"}
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <article className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">About this course</h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-700">
                {descriptionParagraphs.length ? (
                  descriptionParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <p>
                    Detailed course information will appear here once the instructor completes the listing. In the
                    meantime, contact our team if you need a full syllabus.
                  </p>
                )}
              </div>
            </article>

            <article className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Curriculum preview</h2>
                  <p className="text-sm text-slate-500">Video lessons are published below once available.</p>
                </div>
                <Badge variant="secondary">{lessonCount} lesson{lessonCount === 1 ? "" : "s"}</Badge>
                {canStreamLessons ? (
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    {completedLessonsCount} of {lessonCount} completed
                  </Badge>
                ) : null}
              </div>
              {progressError ? (
                <p className="mt-2 text-xs text-rose-500">{progressError}</p>
              ) : null}

              {lessonsLoading ? (
                <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading lessons...
                </div>
              ) : lessons.length ? (
                <div className="mt-8 space-y-4">
                  {lessons.map((lesson, index) => {
                    const resolvedVideoUrl = buildAssetUrl(
                      lesson.videoUrl ||
                        lesson.assetUrl ||
                        lesson.videoURL ||
                        lesson.assetURL ||
                        "",
                    );
                    const canWatchLesson = Boolean(resolvedVideoUrl && canStreamLessons);
                    const gatingMessage =
                      normalizedEnrollmentStatus === "pending"
                        ? "Access pending review."
                        : "Unlock after enrollment.";
                    const lessonKey =
                      resolveLessonIdentifier(lesson) || `${courseId || "course"}-lesson-${index + 1}`;
                    const isCompleted = lessonKey ? progressMap.has(lessonKey) : false;
                    const completionRecord = lessonKey ? progressMap.get(lessonKey) : null;
                    const isSaving = progressSaving === lessonKey;
                    return (
                      <div
                        key={lessonKey}
                        className={cn(
                          "flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-sm text-slate-700 transition hover:border-slate-200 hover:bg-white",
                          isCompleted ? "border-emerald-200 bg-emerald-50/80" : "",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                            {lesson.lessonNumber ?? "-"}
                          </span>
                          <div className="flex-1">
                            <p className="text-lg font-semibold text-slate-900">{lesson.title}</p>
                            {lesson.description ? (
                              <p className="text-sm text-slate-600">{lesson.description}</p>
                            ) : null}
                            {isCompleted ? (
                              <span className="mt-1 inline-flex items-center text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Completed{" "}
                                {completionRecord?.completedAt
                                  ? `on ${new Date(completionRecord.completedAt).toLocaleDateString()}`
                                  : ""}
                              </span>
                            ) : null}
                          </div>
                          {/* Duration chip moved next to Watch button */}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          {canWatchLesson ? (
                <div className="flex flex-wrap items-center gap-3">
                              <button
                                type="button"
                                onClick={() => openLessonPlayer(lesson, resolvedVideoUrl)}
                                className="inline-flex items-center rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                              >
                                <PlayCircle className="mr-2 h-5 w-5" />
                                Watch lesson
                              </button>
                              <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-slate-600">
                                  <Clock className="h-4 w-4" />
                                  {lesson.durationSeconds
                                    ? formatDurationLabel(lesson.durationSeconds)
                                    : null}
                                </span>
                                {isCompleted && completionRecord?.completedAt ? (
                                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-emerald-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Completed on {new Date(completionRecord.completedAt).toLocaleDateString()}
                                  </span>
                                ) : null}
                              </div>
                              {!isCompleted ? (
                                <span className="text-[11px] uppercase tracking-wide text-slate-400">
                                  Auto-completes after playback finishes.
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">{gatingMessage}</span>
                          )}
                          {/* Removed filename display per request */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={cn("mt-8 text-sm", lessonsError ? "text-rose-500" : "text-slate-500")}>
                  {lessonsError || "Lessons will appear here once the instructor uploads the curriculum."}
                </p>
              )}            </article>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                  <PlayCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Self-paced experience</p>
                  <p className="text-lg font-semibold text-slate-900">Stream on any device</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Get lifelong access to every video lesson once you enroll in our inperson classes.
              </p>
              <p className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Online enrollment is disabled for this reader experience. Visit our campus or reach out to admissions to
                secure your seat.
              </p>
            </div>

            {canStreamLessons ? (
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-50 p-3 text-purple-600">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Course assessment</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {assessmentReady ? "Validate your knowledge" : "Assessment coming soon"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  {assessmentLoading || attemptsLoading ? (
                    <span className="inline-flex items-center text-xs text-slate-400">
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Loading assessment details...
                    </span>
                  ) : assessmentReady ? (
                    latestAttempt ? (
                      <>
                        <p>
                          Latest score{" "}
                          <span className="font-semibold">
                            {Math.round(Number(latestAttempt.scorePercent ?? 0))}% (
                            {latestAttempt.correctCount}/{latestAttempt.questionCount})
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">
                          Attempted {new Date(latestAttempt.submittedAt).toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <p>Complete the quiz to unlock certificates faster.</p>
                    )
                  ) : (
                    <p>No assessment has been published for this course yet.</p>
                  )}
                </div>
                  {assessmentLockedByLessons ? (
                    <p className="mt-3 text-xs text-amber-600">
                      Complete every lesson to unlock the assessment.
                    </p>
                  ) : null}
                  {assessmentNotice ? (
                    <p className="mt-3 text-xs font-medium text-emerald-600">{assessmentNotice}</p>
                  ) : null}
                {assessmentError ? (
                  <p className="mt-2 text-xs text-rose-500">{assessmentError}</p>
                ) : null}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  {shouldShowRetakeButton ? (
                    <button
                      type="button"
                      onClick={() => {
                      if (!assessmentReady || assessmentLockedByLessons) {
                        return;
                      }
                      setAssessmentDialogOpen(true);
                      setAssessmentSubmitError("");
                      setCertificateError("");
                    }}
                      disabled={!assessmentReady || assessmentLockedByLessons}
                      className={cn(
                        "inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300",
                        assessmentReady && !assessmentLockedByLessons
                          ? "bg-purple-600 text-white hover:bg-purple-500"
                          : "cursor-not-allowed bg-slate-200 text-slate-500",
                      )}
                    >
                      {latestAttempt ? "Retake assessment" : "Take assessment"}
                    </button>
                  ) : null}
                  {shouldShowCertificateButton ? (
                    <button
                      type="button"
                      onClick={handleCertificateDownload}
                      disabled={certificateGenerating}
                      className={cn(
                        "inline-flex w-full items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100",
                        certificateGenerating ? "cursor-not-allowed opacity-70" : "",
                      )}
                    >
                      {certificateGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Preparing...
                        </>
                      ) : (
                        "Get certificate"
                      )}
                    </button>
                  ) : null}
                </div>
                {certificateError ? (
                  <p className="text-xs text-rose-500">{certificateError}</p>
                ) : null}
              </div>
            ) : null}

            <div
              className={cn(
                "rounded-2xl border p-6 shadow-sm",
                isInPersonOnlyReviewer ? "border-amber-300 bg-amber-50 text-amber-900" : "border bg-white text-slate-900",
              )}
            >
              <h3 className="text-lg font-semibold">
                {isInPersonOnlyReviewer ? "Manual enrollment required" : "Enroll Course?"}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Please come to our campus to enroll in this course. If you have any questions, feel free to reach out to us.
              </p>
              {isInPersonOnlyReviewer ? (
                <p className="mt-2 text-xs text-amber-800">
                  Thanks for reviewing the app! Once our admin team confirms your in-person visit, they&apos;ll unlock the course for this account.
                </p>
              ) : null}
            </div>
          </aside>
        </section>
      </main>
      <Dialog
        open={Boolean(isLessonPlayerOpen && activeLesson)}
        onOpenChange={(open) => {
          setLessonPlayerOpen(open);
          if (!open && videoRef.current) {
            videoRef.current.pause();
          }
        }}
      >
        <DialogContent forceMount className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{activeLesson?.title || "Lesson player"}</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {activeLesson?.description || "Stream this lesson directly in your browser."}
            </DialogDescription>
          </DialogHeader>
          {activeLessonVideoUrl ? (
            <div className="mt-4">
              <video
                key={activeLessonVideoUrl}
                ref={videoRef}
                src={activeLessonVideoUrl}
                controls
                autoPlay
                controlsList="nodownload noplaybackrate noremoteplayback"
                disablePictureInPicture
                onTimeUpdate={handleVideoTimeUpdate}
                onSeeking={handleVideoSeeking}
                onSeeked={handleVideoSeeking}
                onLoadedMetadata={handleVideoLoaded}
                onEnded={() => handleLessonComplete(activeLesson)}
                onContextMenu={(event) => event.preventDefault()}
                className="h-[60vh] w-full rounded-2xl bg-black object-contain"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Lesson {activeLesson?.lessonNumber ?? "-"} •{" "}
                  {activeLesson?.durationSeconds
                    ? formatDurationLabel(activeLesson.durationSeconds)
                    : "On demand"}
                </span>
                {activeLesson?.sizeMB ? <span>{activeLesson.sizeMB} MB</span> : null}
              </div>
            </div>
          ) : (
            <p className="text-sm text-rose-500">
              We couldn't load this video file. Please contact support to re-upload the lesson asset.
            </p>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={assessmentDialogOpen}
        onOpenChange={(open) => {
          setAssessmentDialogOpen(open);
          if (!open) {
            setAssessmentSubmitError("");
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Course assessment</DialogTitle>
            <DialogDescription>
              Answer each multiple choice question to lock in your progress.
            </DialogDescription>
          </DialogHeader>
          {assessmentReady ? (
            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              {assessmentQuestions.map((question, index) => (
                <div key={question.id || index} className="rounded-xl border p-4 text-sm">
                  <p className="font-semibold text-slate-900">
                    {index + 1}. {question.prompt}
                  </p>
                  {question.explanation ? (
                    <p className="mt-1 text-xs text-slate-500">{question.explanation}</p>
                  ) : null}
                  <div className="mt-3 space-y-2">
                    {Array.isArray(question.choices)
                      ? question.choices.map((choice) => {
                          const choiceId = String(choice.id);
                          const selected = selectedAnswers[String(question.id)] === choiceId;
                          return (
                            <label
                              key={choiceId}
                              className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition",
                                selected
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-slate-200 hover:border-slate-300",
                              )}
                            >
                              <input
                                type="radio"
                                className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                                name={`question-${question.id}`}
                                checked={selected}
                                onChange={() => handleSelectAnswer(question.id, choiceId)}
                              />
                              <span>{choice.text}</span>
                            </label>
                          );
                        })
                      : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Assessment is not available yet for this course.</p>
          )}
          {assessmentSubmitError ? (
            <p className="text-sm text-rose-500">{assessmentSubmitError}</p>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setAssessmentDialogOpen(false)}
              className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssessmentSubmit}
              disabled={!assessmentReady || assessmentSubmitting}
              className="inline-flex items-center rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {assessmentSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit assessment"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
