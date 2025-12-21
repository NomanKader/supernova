import * as React from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/marketing/auth-context";
import { apiFetch, BUSINESS_NAME } from "@/config/api";
import { resolveCourseImage, resolveCourseTitle, formatDurationLabel } from "@/utils/course";

const levelFilters = ["all", "beginner", "intermediate", "advanced"];

const courseMeta = {
  "c-001": {
    image:
      "https://images.unsplash.com/photo-1526481280695-3c4692f07e87?auto=format&fit=crop&w=1200&q=80",
    price: "$89",
    originalPrice: "$129",
    rating: 4.9,
    reviewCount: 286,
    hours: "40 hours",
    nextStart: "February 10, 2026",
    students: 12847,
  },
  "c-002": {
    image:
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80",
    price: "$79",
    originalPrice: "$119",
    rating: 4.8,
    reviewCount: 214,
    hours: "35 hours",
    nextStart: "March 3, 2026",
    students: 9563,
  },
  "c-003": {
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    price: "$99",
    originalPrice: "$149",
    rating: 4.9,
    reviewCount: 332,
    hours: "50 hours",
    nextStart: "April 14, 2026",
    students: 8234,
  },
  "c-004": {
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
    price: "$279",
    rating: 4.6,
    reviewCount: 104,
    hours: "28 hours",
    nextStart: "March 24, 2026",
    students: 4872,
  },
};

const normalizeDataArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }
  return [];
};

export default function CoursesPage() {
  const { isAuthenticated, user } = useAuth();
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [activeLevel, setActiveLevel] = React.useState("all");
  const [courses, setCourses] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [instructors, setInstructors] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [enrollmentLookup, setEnrollmentLookup] = React.useState(() => new Map());
  const [enrollmentError, setEnrollmentError] = React.useState("");
  const [enrollmentLoading, setEnrollmentLoading] = React.useState(false);

  const activeCoursesPath = React.useMemo(() => {
    const params = new URLSearchParams();
    if (BUSINESS_NAME) {
      params.set("businessName", BUSINESS_NAME);
    }
    params.set("status", "active");
    const query = params.toString();
    return `/api/courses${query ? `?${query}` : ""}`;
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const courseResponse = await apiFetch(activeCoursesPath);
        let categoryData = [];
        let instructorData = [];

        try {
          const categoryPath = BUSINESS_NAME
            ? `/api/course-categories?businessName=${encodeURIComponent(BUSINESS_NAME)}`
            : "/api/course-categories";
          const categoriesResponse = await apiFetch(categoryPath);
          categoryData = normalizeDataArray(categoriesResponse);
        } catch (categoryError) {
          console.warn("Failed to load course categories", categoryError);
        }

        if (BUSINESS_NAME) {
          try {
            const usersResponse = await apiFetch(
              `/api/users?businessName=${encodeURIComponent(BUSINESS_NAME)}`,
            );
            instructorData = normalizeDataArray(usersResponse);
          } catch (usersError) {
            console.warn("Failed to load instructors", usersError);
          }
        }

        if (!isMounted) {
          return;
        }

        const courseList = normalizeDataArray(courseResponse);
        const activeCourses = courseList.filter(
          (course) => (course.status || '').toLowerCase() === 'active',
        );
        setCourses(activeCourses);
        setCategories(categoryData);
        setInstructors(instructorData);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }
        setError(fetchError.message || "Failed to load courses.");
        setCourses([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeCoursesPath]);

  React.useEffect(() => {
    if (!isAuthenticated || (!user?.email && user?.id == null)) {
      setEnrollmentLookup(new Map());
      setEnrollmentError("");
      setEnrollmentLoading(false);
      return;
    }

    let isMounted = true;

    const loadEnrollmentStatus = async () => {
      setEnrollmentError("");
      setEnrollmentLoading(true);
      try {
        const params = new URLSearchParams();
        if (BUSINESS_NAME) {
          params.set("businessName", BUSINESS_NAME);
        }
        if (user?.email) {
          params.set("learnerEmail", user.email);
        }
        if (user?.id !== undefined && user?.id !== null) {
          params.set("userId", String(user.id));
        }
        const query = params.toString();
        const endpoint = `/api/enrollments/manual${query ? `?${query}` : ""}`;
        const response = await apiFetch(endpoint);
        if (!isMounted) {
          return;
        }
        const dataset = normalizeDataArray(response);
        const map = new Map();
        dataset.forEach((entry) => {
          if (!entry || entry.courseId === undefined || entry.courseId === null) {
            return;
          }
          const key = String(entry.courseId);
          const existing = map.get(key);
          if (!existing) {
            map.set(key, entry);
            return;
          }
          const existingTime = existing.submittedAt
            ? new Date(existing.submittedAt).getTime()
            : 0;
          const nextTime = entry.submittedAt ? new Date(entry.submittedAt).getTime() : 0;
          if (!Number.isFinite(existingTime) || nextTime >= existingTime) {
            map.set(key, entry);
          }
        });
        setEnrollmentLookup(map);
      } catch (err) {
        if (isMounted) {
          setEnrollmentError(err.message || "Unable to load your enrollment status.");
          setEnrollmentLookup(new Map());
        }
      } finally {
        if (isMounted) {
          setEnrollmentLoading(false);
        }
      }
    };

    loadEnrollmentStatus();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.email, user?.id]);

  const categoryOptions = React.useMemo(
    () =>
      categories.map((category) => ({
        id:
          category?.id !== undefined && category?.id !== null
            ? String(category.id)
            : category?.slug || category?.name || "",
        label: category?.name || category?.slug || "Category",
      })),
    [categories],
  );

  const categoryFilters = React.useMemo(() => {
    const ids = categoryOptions.map((option) => option.id).filter(Boolean);
    return ["all", ...ids];
  }, [categoryOptions]);

  const categoryLabelMap = React.useMemo(() => {
    const map = new Map();
    categoryOptions.forEach((option) => {
      if (option.id) {
        map.set(option.id, option.label);
      }
    });
    return map;
  }, [categoryOptions]);

  const instructorMap = React.useMemo(() => {
    const map = new Map();
    instructors.forEach((instructor) => {
      const key =
        instructor?.id !== undefined && instructor?.id !== null
          ? String(instructor.id)
          : instructor?.email || null;
      if (key) {
        map.set(key, instructor);
      }
    });
    return map;
  }, [instructors]);

  const resolveCategory = React.useCallback(
    (categoryId) => {
      if (!categoryId) {
        return "General";
      }
      const label = categoryLabelMap.get(String(categoryId));
      return label || "General";
    },
    [categoryLabelMap],
  );

  const resolveInstructors = React.useCallback(
    (instructorIds = []) => {
      const normalizedIds = Array.isArray(instructorIds)
        ? instructorIds
        : instructorIds
          ? [instructorIds]
          : [];
      const names = normalizedIds
        .map((instructorId) => instructorMap.get(String(instructorId))?.name)
        .filter(Boolean);
      if (names.length === 0) return "Supernova Mentor Team";
      if (names.length === 1) return names[0];
      if (names.length === 2) return `${names[0]} & ${names[1]}`;
      const last = names[names.length - 1];
      const others = names.slice(0, -1).join(", ");
      return `${others} & ${last}`;
    },
    [instructorMap],
  );

  const visibleCourses = React.useMemo(() => {
    return courses.filter((course) => {
      const categoryMatch =
        activeCategory === "all"
          ? true
          : String(course.categoryId ?? course.categorySlug ?? "") === activeCategory;
      const levelMatch = activeLevel === "all" ? true : course.level === activeLevel;
      return categoryMatch && levelMatch;
    });
  }, [courses, activeCategory, activeLevel]);

  const resolvedTotalCount = courses.length;

  return (
    <div className="space-y-10 pb-16">
      <section className="bg-gradient-to-r from-[#1d56d7] via-[#1a4fd0] to-[#1445c4] px-6 py-20 text-center text-white sm:px-10">
        <div className="mx-auto max-w-3xl space-y-5">
          <h1 className="text-4xl font-bold sm:text-5xl">Explore Our Courses</h1>
          <p className="text-base leading-relaxed text-blue-100 sm:text-lg">
            Discover expert-led courses designed to help you master new skills and advance your
            career. Choose from our comprehensive catalog of professional development programs.
          </p>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-slate-600">Category:</span>
            {categoryFilters.map((value) => {
              const label =
                value === "all"
                  ? "All"
                  : categoryLabelMap.get(value) ?? value ?? "Category";
              const isActive = activeCategory === value;
              return (
                <Button
                  key={value}
                  variant="outline"
                  onClick={() => setActiveCategory(value)}
                  className={
                    isActive
                      ? "rounded-full border-transparent bg-blue-600 px-5 text-white shadow"
                      : "rounded-full border-slate-200 px-5 text-slate-600 hover:border-blue-400 hover:text-blue-600"
                  }
                >
                  {label}
                </Button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-slate-600">Level:</span>
            {levelFilters.map((value) => {
              const label = value === "all" ? "All" : value.charAt(0).toUpperCase() + value.slice(1);
              const isActive = activeLevel === value;
              return (
                <Button
                  key={value}
                  variant="outline"
                  onClick={() => setActiveLevel(value)}
                  className={
                    isActive
                      ? "rounded-full border-transparent bg-blue-600 px-5 text-white shadow"
                      : "rounded-full border-slate-200 px-5 text-slate-600 hover:border-blue-400 hover:text-blue-600"
                  }
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
        <div className="self-end rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
          Showing {visibleCourses.length} of {resolvedTotalCount} courses
        </div>
        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}
        {isAuthenticated && enrollmentError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            {enrollmentError}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-3 rounded-3xl border border-slate-100 bg-white px-6 py-8 text-slate-500 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            Loading the latest courses...
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {visibleCourses.map((course, index) => {
              const meta = courseMeta[course.id] ?? {
                image:
                  "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80",
                price: "$249",
                originalPrice: null,
                rating: null,
                nextStart: "Rolling admissions",
                reviewCount: null,
                hours: `${course.lessons ?? 0} lessons`,
                students: course.enrollments ?? 0,
              };
              const levelLabel =
                typeof course.level === "string" && course.level.length > 0
                  ? course.level.charAt(0).toUpperCase() + course.level.slice(1)
                  : "All Levels";

              const resolvedImage =
                resolveCourseImage(course, meta.image ? [meta.image] : [], index) || meta.image;
              const resolvedTitle = resolveCourseTitle(course) || "Untitled Course";
              const numericPrice =
                course.price !== undefined && course.price !== null
                  ? Number(course.price)
                  : null;
              const resolvedPrice = Number.isFinite(numericPrice) ? numericPrice : meta.price;
              const durationSeconds =
                course.durationSeconds !== undefined && course.durationSeconds !== null
                  ? Number(course.durationSeconds)
                  : null;
              const durationLabel =
                Number.isFinite(durationSeconds) && durationSeconds > 0
                  ? formatDurationLabel(durationSeconds)
                  : null;
              const enrollmentRecord = enrollmentLookup.get(String(course.id));
              const statusForCourse = enrollmentRecord?.status || null;
              const rejectionNotes =
                statusForCourse && statusForCourse.toLowerCase() === "rejected"
                  ? (enrollmentRecord?.reviewNotes?.trim()
                      ? enrollmentRecord.reviewNotes
                      : enrollmentRecord?.notes || null)
                  : null;

              return (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={resolvedTitle}
                  category={resolveCategory(course.categoryId)}
                  description={course.description}
                  instructors={resolveInstructors(course.instructorIds)}
                  lessonCount={course.lessons}
                  level={levelLabel}
                  nextStart={meta.nextStart}
                  price={resolvedPrice}
                  originalPrice={meta.originalPrice}
                  hours={durationLabel ?? meta.hours}
                  durationSeconds={durationSeconds && Number.isFinite(durationSeconds) ? durationSeconds : undefined}
                  image={resolvedImage}
                  enrollmentStatus={statusForCourse}
                  enrollmentNotes={rejectionNotes}
                />
              );
            })}
          </div>
        )}

        <div className="flex flex-col items-center gap-3 rounded-3xl bg-slate-50 py-6 text-center">
          <p className="text-sm text-slate-600">
            Looking for a custom cohort for your team?{" "}
            <Link to="/contact" className="font-semibold text-blue-600 hover:text-blue-700">
              Talk to our corporate training crew.
            </Link>
          </p>
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link to="/promotions">View current promotions</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
