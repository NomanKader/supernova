import { API_BASE_URL } from "@/config/api";

const API_BASE = (API_BASE_URL || "").replace(/\/$/, "");

const hasValue = (value) => typeof value === "string" && value.trim().length > 0;

export function buildAssetUrl(imagePath) {
  if (!hasValue(imagePath)) {
    return null;
  }
  const trimmed = imagePath.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    const protocol =
      typeof window !== "undefined" && window.location ? window.location.protocol : "https:";
    return `${protocol}${trimmed}`;
  }
  if (!API_BASE) {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${API_BASE}${normalizedPath}`;
}

export function resolveCourseTitle(course) {
  if (!course || typeof course !== "object") {
    return null;
  }
  const candidates = [
    course.title,
    course.name,
    course.courseTitle,
    course.course_title,
    course.course_name,
    course.fullTitle,
    course.full_title,
  ];
  const title = candidates.find((value) => hasValue(value));
  return title ? title.trim() : null;
}

export function resolveCourseImage(course, fallbackImages = [], fallbackIndex = 0) {
  const candidates = [
    course?.imageUrl,
    course?.imageURL,
    course?.image,
    course?.thumbnail,
    course?.thumbnailUrl,
    course?.thumbnailURL,
    course?.coverImage,
    course?.cover_image,
    course?.featuredImage,
    course?.featured_image,
    course?.bannerImage,
    course?.assetUrl,
    course?.assetURL,
  ];
  const source = candidates.find((value) => hasValue(value));
  if (source) {
    const resolved = buildAssetUrl(source);
    if (resolved) {
      return resolved;
    }
  }
  if (fallbackImages.length > 0) {
    const index = Math.abs(fallbackIndex) % fallbackImages.length;
    return fallbackImages[index];
  }
  return null;
}

function formatCurrency(amount) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPriceLabel(value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) {
      return "Free";
    }
    return formatCurrency(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Free";
    }
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) {
      return numeric <= 0 ? "Free" : formatCurrency(numeric);
    }
    return trimmed;
  }
  return "Free";
}
