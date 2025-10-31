import * as React from "react";
import { Link } from "react-router-dom";

import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { courses, categories, users } from "@/data/mock-data";

const categoryFilters = ["all", ...categories.map((category) => category.id)];
const levelFilters = ["all", "beginner", "intermediate", "advanced"];

const courseMeta = {
  "c-001": {
    image:
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=1200&q=80",
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

function resolveCategory(categoryId) {
  return categories.find((category) => category.id === categoryId)?.name ?? "General";
}

function resolveInstructors(instructorIds = []) {
  const names = instructorIds
    .map((instructorId) => users.find((user) => user.id === instructorId)?.name)
    .filter(Boolean);
  if (names.length === 0) return "Supernova Mentor Team";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  const last = names[names.length - 1];
  const others = names.slice(0, -1).join(", ");
  return `${others} & ${last}`;
}

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [activeLevel, setActiveLevel] = React.useState("all");

  const visibleCourses = React.useMemo(() => {
    return courses.filter((course) => {
      const categoryMatch =
        activeCategory === "all" ? true : course.categoryId === activeCategory;
      const levelMatch = activeLevel === "all" ? true : course.level === activeLevel;
      return categoryMatch && levelMatch;
    });
  }, [activeCategory, activeLevel]);

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
                  : categories.find((category) => category.id === value)?.name ?? value;
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
          Showing {visibleCourses.length} of {courses.length} courses
        </div>

        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {visibleCourses.map((course) => {
            const meta = courseMeta[course.id] ?? {
              image:
                "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80",
              price: "$249",
              originalPrice: null,
              rating: null,
              nextStart: "Rolling admissions",
              reviewCount: null,
              hours: `${course.lessons} lessons`,
              students: course.enrollments ?? 0,
            };
            const levelLabel =
              typeof course.level === "string" && course.level.length > 0
                ? course.level.charAt(0).toUpperCase() + course.level.slice(1)
                : "All Levels";

            return (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                category={resolveCategory(course.categoryId)}
                description={course.description}
                instructors={resolveInstructors(course.instructorIds)}
                lessonCount={course.lessons}
                level={levelLabel}
                enrollments={course.enrollments ?? 0}
                nextStart={meta.nextStart}
                // price={meta.price}
                originalPrice={meta.originalPrice}
                rating={meta.rating}
                reviewCount={meta.reviewCount}
                hours={meta.hours}
                students={meta.students}
                image={meta.image}
              />
            );
          })}
        </div>

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
