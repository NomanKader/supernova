import { Link } from "react-router-dom";
import { BookOpen, Calendar, Clock } from "lucide-react";
import { formatPriceLabel } from "@/utils/course";

export function CourseCard({
  id,
  title,
  category,
  description,
  instructors,
  lessonCount,
  level,
  nextStart,
  price,
  originalPrice,
  hours,
  image,
}) {
  const displayPrice = formatPriceLabel(price);
  const normalizedOriginalPrice =
    originalPrice !== undefined && originalPrice !== null
      ? formatPriceLabel(originalPrice)
      : null;
  const hasOriginalPrice =
    Boolean(normalizedOriginalPrice) && normalizedOriginalPrice !== displayPrice;

  const detailPath = `/courses/${id}`;

  return (
    <Link
      to={detailPath}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
    >
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
            <Calendar className="h-4 w-4 text-cyan-500" />
            <div>
              <dt className="text-xs text-slate-500">Next cohort</dt>
              <dd className="font-medium text-slate-800">{nextStart}</dd>
            </div>
          </div>
        </dl>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600">{displayPrice}</span>
              {hasOriginalPrice ? (
                <span className="text-sm font-medium text-slate-400 line-through">
                  {normalizedOriginalPrice}
                </span>
              ) : null}
            </div>
          </div>
          <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700">
            See Details
          </span>
        </div>
      </div>
    </Link>
  );
}
