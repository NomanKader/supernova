import * as React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, Layers, Users, PlayCircle } from "lucide-react";
import { apiFetch, BUSINESS_NAME } from "@/config/api";
import { buildAssetUrl, formatPriceLabel } from "@/utils/course";
import { useAuth } from "@/components/marketing/auth-context";
import { cn } from "@/lib/utils";

const FALLBACK_COURSE = {
  title: "Course not found",
  description:
    "We couldn't locate this course. It may have been unpublished or moved. Please return to the catalog to explore other learning paths.",
  price: 0,
  level: "Beginner",
};

function splitDescription(text) {
  if (!text) {
    return [];
  }
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = React.useState(null);
  const [lessons, setLessons] = React.useState([]);
  const [categories, setCategories] = React.useState(new Map());
  const [courseLoading, setCourseLoading] = React.useState(true);
  const [lessonsLoading, setLessonsLoading] = React.useState(true);
  const [courseError, setCourseError] = React.useState(null);
  const [lessonsError, setLessonsError] = React.useState(null);

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

  const resolvedCourse = course || FALLBACK_COURSE;
  const heroImage = resolvedCourse.imageUrl ? buildAssetUrl(resolvedCourse.imageUrl) : null;
  const categoryLabel =
    (resolvedCourse.categoryId && categories.get(String(resolvedCourse.categoryId))) ||
    resolvedCourse.categoryLabel ||
    "Featured course";
  const priceLabel = formatPriceLabel(resolvedCourse.price);
  const lessonCount = lessons.length || resolvedCourse.lessons || 0;
  const descriptionParagraphs = splitDescription(resolvedCourse.description);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [courseId]);

  const handleEnroll = () => {
    if (!course || !course.id) {
      navigate("/courses");
      return;
    }

    if (!user) {
      const redirectTarget = `/checkout/${course.id}`;
      navigate(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
      return;
    }

    navigate(`/checkout/${course.id}`);
  };

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
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100" onClick={handleEnroll}>
              {user ? "Enroll now" : "Sign up to enroll"}
            </Button>
            <Link
              to="/courses"
              className="text-sm font-medium text-slate-100 underline-offset-4 hover:underline"
            >
              Browse all courses
            </Link>
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
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {resolvedCourse.hours || `${lessonCount} lessons`}
            </p>
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
              </div>

              {lessonsLoading ? (
                <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading lessons...
                </div>
              ) : lessons.length ? (
                <div className="mt-8 space-y-4">
                  {lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-sm text-slate-700 transition hover:border-slate-200 hover:bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                          {lesson.lessonNumber ?? "-"}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{lesson.title}</p>
                          {lesson.description ? (
                            <p className="text-xs text-slate-500">{lesson.description}</p>
                          ) : null}
                        </div>
                        <span className="text-xs text-slate-500">
                          {lesson.sizeMB ? `${lesson.sizeMB} MB` : null}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={cn("mt-8 text-sm", lessonsError ? "text-rose-500" : "text-slate-500")}>
                  {lessonsError || "Lessons will appear here once the instructor uploads the curriculum."}
                </p>
              )}
            </article>
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
                Get lifelong access to every video lesson once you enroll. Download resources and follow along at your
                own pace.
              </p>
              <Button className="mt-6 w-full" onClick={handleEnroll}>
                Enroll Now
              </Button>
              <p className="mt-3 text-center text-xs text-slate-500">
                100% money-back guarantee within 7 days of enrollment.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Need more info?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Contact our support team for the full syllabus or talk to an enrollment advisor.
              </p>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <Link to="/contact-us" className="text-blue-600 hover:underline">
                  Contact us
                </Link>
                <span>Email: support@edusupernova.com</span>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
