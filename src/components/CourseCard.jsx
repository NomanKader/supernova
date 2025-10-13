import { Link } from "react-router-dom";
import { BookOpen, Calendar, Clock, Star, Users } from "lucide-react";

export function CourseCard({
  id,
  title,
  category,
  description,
  instructors,
  lessonCount,
  level,
  enrollments = 0,
  nextStart,
  price,
  originalPrice,
  rating,
  reviewCount,
  hours,
  students,
  image,
}) {
  const totalStudents = students ?? enrollments;
  const hasOriginalPrice = Boolean(originalPrice && originalPrice !== price);
  const formattedReviews =
    typeof reviewCount === "number" ? reviewCount.toLocaleString() : null;
  const formattedStudents =
    typeof totalStudents === "number" ? totalStudents.toLocaleString() : null;
  const numericRating =
    typeof rating === "number" ? rating : Number.parseFloat(String(rating ?? ""));
  const hasNumericRating = Number.isFinite(numericRating);
  const ratingLabel = hasNumericRating ? numericRating.toFixed(1) : rating;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-0 right-0 top-0 flex items-start justify-between p-4">
          <span className="inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-700 shadow">
            {category}
          </span>
          <span className="inline-flex items-center rounded-full bg-cyan-600/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow">
            {level}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 space-y-2">
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <p className="text-sm font-medium text-slate-500">by {instructors}</p>
          <p className="text-sm text-slate-600 line-clamp-3">{description}</p>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-500" />
            <div>
              <dt className="text-xs text-slate-500">Duration</dt>
              <dd className="font-medium text-slate-800">{hours ?? `${lessonCount} lessons`}</dd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-cyan-500" />
            <div>
              <dt className="text-xs text-slate-500">Lessons</dt>
              <dd className="font-medium text-slate-800">{lessonCount}</dd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-cyan-500" />
            <div>
              <dt className="text-xs text-slate-500">Students</dt>
              <dd className="font-medium text-slate-800">
                {formattedStudents ?? enrollments.toLocaleString()}
              </dd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cyan-500" />
            <div>
              <dt className="text-xs text-slate-500">Next cohort</dt>
              <dd className="font-medium text-slate-800">{nextStart}</dd>
            </div>
          </div>
        </dl>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div className="space-y-3">
            {rating ? (
              <div className="flex items-center gap-2 text-sm text-slate-800">
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {ratingLabel}
                </span>
                {formattedReviews ? (
                  <span className="text-xs text-slate-500">({formattedReviews} reviews)</span>
                ) : null}
              </div>
            ) : null}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600">{price}</span>
              {hasOriginalPrice ? (
                <span className="text-sm font-medium text-slate-400 line-through">
                  {originalPrice}
                </span>
              ) : null}
            </div>
          </div>
          <Link
            to={`/enroll/${id}`}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700"
          >
            Enroll Now
          </Link>
        </div>
      </div>
    </article>
  );
}
