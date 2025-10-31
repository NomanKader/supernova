import * as React from "react";
import {
  ArrowRight,
  Clock,
  Download,
  Globe,
  Layers,
  Lock,
  Play,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "@/components/marketing/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  assessments,
  categories,
  courses,
  lessonAssets,
  users,
} from "@/data/mock-data";
import { cn } from "@/lib/utils";

const courseMeta = {
  "c-001": {
    heroImage:
      "https://images.unsplash.com/photo-1526481280695-3c4692f07e87?auto=format&fit=crop&w=1600&q=80",
    price: "$89",
    originalPrice: "$129",
    discount: "31% off",
    duration: "40 hours",
    lessons: 156,
    language: "English",
    lastUpdated: "December 2024",
    rating: 4.9,
    students: 12847,
    includes: [
      "40 hours on demand video",
      "Downloadable resources",
      "Access on mobile and TV",
      "Certificate of completion",
    ],
    curriculum: [
      {
        title: "Frontend Fundamentals",
        lessons: 25,
        hours: "8 hours",
        topics: [
          "HTML5 & Semantic Markup",
          "CSS3 & Flexbox/Grid",
          "JavaScript ES6+",
          "Responsive Design",
        ],
      },
      {
        title: "React Development",
        lessons: 35,
        hours: "12 hours",
        topics: ["Components & JSX", "State & Props", "Hooks & Context", "React Router"],
      },
      {
        title: "Backend Development",
        lessons: 40,
        hours: "15 hours",
        topics: ["Node.js Fundamentals", "Express.js Framework", "RESTful APIs", "Authentication"],
      },
      {
        title: "Database & Deployment",
        lessons: 30,
        hours: "10 hours",
        topics: ["MongoDB Basics", "Database Design", "Cloud Deployment", "DevOps Basics"],
      },
    ],
    learning: [
      "Build responsive websites with HTML, CSS, and JavaScript.",
      "Create RESTful APIs with Node.js and Express.",
      "Deploy applications to cloud platforms.",
      "Use Git for version control and collaboration.",
      "Master React.js and modern frontend development workflows.",
      "Work with MongoDB and database design best practices.",
      "Implement authentication and security patterns.",
      "Apply modern deployment pipelines and tooling.",
    ],
    requirements: [
      "Basic computer skills and internet access.",
      "No prior programming experience required.",
      "Willingness to learn and practice coding.",
      "A computer with at least 4GB RAM.",
    ],
  },
  "c-002": {
    heroImage:
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1600&q=80",
    price: "$79",
    originalPrice: "$119",
    discount: "34% off",
    duration: "35 hours",
    lessons: 128,
    language: "English",
    lastUpdated: "January 2025",
    rating: 4.8,
    students: 9563,
    includes: [
      "35 hours on demand video",
      "Campaign templates & worksheets",
      "Access on mobile and TV",
      "Certificate of completion",
    ],
    curriculum: [
      {
        title: "Marketing Foundations",
        lessons: 20,
        hours: "6 hours",
        topics: ["Brand Positioning", "Customer Segmentation", "Value Proposition Design"],
      },
      {
        title: "Acquisition Engines",
        lessons: 30,
        hours: "10 hours",
        topics: ["Paid Ads Strategy", "SEO & Content", "Referral Loops", "Campaign Analytics"],
      },
      {
        title: "Lifecycle & Retention",
        lessons: 25,
        hours: "8 hours",
        topics: ["Email Automation", "Product Marketing Plays", "Churn Prevention"],
      },
      {
        title: "Data & Storytelling",
        lessons: 18,
        hours: "6 hours",
        topics: ["Dashboard Building", "Cohort Analysis", "Executive Reporting"],
      },
    ],
    learning: [
      "Design omnichannel marketing funnels that convert.",
      "Build dashboards to monitor campaign performance.",
      "Master paid acquisition, lifecycle, and retention plays.",
      "Run creative experiments with a documented framework.",
      "Automate email sequences that drive revenue.",
      "Leverage social analytics to inform iteration.",
      "Collaborate with product and sales for go-to-market.",
      "Build an executive marketing report for leadership.",
    ],
    requirements: [
      "Interest in growth, marketing, or communications.",
      "Comfortable with basic spreadsheet skills.",
      "Access to marketing tooling (free trials provided).",
      "Commitment of ~6 hours per week.",
    ],
  },
  "c-003": {
    heroImage:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
    price: "$99",
    originalPrice: "$149",
    discount: "33% off",
    duration: "50 hours",
    lessons: 189,
    language: "English",
    lastUpdated: "November 2024",
    rating: 4.9,
    students: 8234,
    includes: [
      "50 hours on demand video",
      "Production-ready notebooks",
      "Access on mobile and TV",
      "Certificate of completion",
    ],
    curriculum: [
      {
        title: "Data Foundations",
        lessons: 22,
        hours: "7 hours",
        topics: ["Data Wrangling", "Feature Engineering", "Exploratory Analysis"],
      },
      {
        title: "Model Development",
        lessons: 28,
        hours: "9 hours",
        topics: ["Supervised Learning", "Model Evaluation", "Hyperparameter Tuning"],
      },
      {
        title: "MLOps & Deployment",
        lessons: 24,
        hours: "8 hours",
        topics: ["Pipeline Orchestration", "Model Serving", "Monitoring & Alerts"],
      },
      {
        title: "Applied Capstone",
        lessons: 20,
        hours: "6 hours",
        topics: ["Business Problem Framing", "Presentation Storytelling", "Executive Handoff"],
      },
    ],
    learning: [
      "Frame machine learning problems for business stakeholders.",
      "Build reproducible data pipelines with modern tooling.",
      "Train, tune, and evaluate supervised learning models.",
      "Ship models using MLOps and monitoring best practices.",
      "Collaborate with data engineering and product teams.",
      "Translate insights into executive-ready storytelling.",
      "Integrate ethical considerations and bias mitigation.",
      "Launch a capstone end-to-end ML project.",
    ],
    requirements: [
      "Intermediate Python and statistics knowledge.",
      "Familiarity with pandas and core ML libraries.",
      "Cloud computing access (credits provided).",
      "Availability for weekly mentor office hours.",
    ],
  },
};

const fallbackMeta = {
  heroImage:
    "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1600&q=80",
  price: "$249",
  originalPrice: null,
  discount: null,
  duration: "32 hours",
  lessons: 90,
  language: "English",
  lastUpdated: "October 2024",
  rating: 4.8,
  students: 6200,
  includes: [
    "On demand video",
    "Downloadable resources",
    "Access on mobile and TV",
    "Certificate of completion",
  ],
  curriculum: [
    {
      title: "Orientation & Foundations",
      lessons: 18,
      hours: "6 hours",
      topics: ["Kickoff & Goal Setting", "Tooling Setup", "Baseline Assessment"],
    },
    {
      title: "Core Skills Lab",
      lessons: 28,
      hours: "9 hours",
      topics: ["Hands-on Workshops", "Peer Feedback Sessions", "Project Checkpoints"],
    },
    {
      title: "Portfolio Sprint",
      lessons: 22,
      hours: "7 hours",
      topics: ["Capstone Planning", "Mentor Reviews", "Showcase Prep"],
    },
  ],
  learning: [
    "Learn industry workflows through guided projects.",
    "Collaborate inside a peer accountability pod.",
    "Ship a portfolio-ready capstone.",
    "Adopt best practices to accelerate your craft.",
  ],
  requirements: [
    "Commit 5-6 hours per week",
    "Stable internet connection",
    "Motivation to learn with peers",
  ],
};

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isSubscribed, purchasedCourses } = useAuth();

  const course = courses.find((item) => item.id === courseId);
  const categoryName =
    categories.find((category) => category.id === course?.categoryId)?.name ??
    "General";
  const meta = course
    ? { ...fallbackMeta, ...(courseMeta[course.id] ?? {}) }
    : null;
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "curriculum", label: "Curriculum" },
    { id: "instructor", label: "Instructor" },
    { id: "reviews", label: "Reviews" },
  ];
  const [activeTab, setActiveTab] = React.useState("overview");

  React.useEffect(() => {
    window.scrollTo({ top: 0 });
    setActiveTab("overview");
  }, [courseId]);

  const { videos, resources, mentors, courseAssessment } = React.useMemo(() => {
    if (!course) {
      return { videos: [], resources: [], mentors: [], courseAssessment: undefined };
    }
    const relatedAssets = lessonAssets.filter(
      (asset) => asset.courseId === course.id,
    );
    return {
      videos: relatedAssets.filter((asset) => asset.type === "video"),
      resources: relatedAssets.filter((asset) => asset.type === "pdf"),
      mentors: users.filter((user) => course.instructorIds?.includes(user.id)),
      courseAssessment: assessments.find(
        (assessment) => assessment.courseId === course.id,
      ),
    };
  }, [course]);

  if (!course || !meta) {
    return <Navigate to="/courses" replace />;
  }

  const hasCourseAccess = isSubscribed || purchasedCourses?.includes(course.id);

  const handleEnroll = () => {
    navigate(`/checkout/${course.id}`);
  };

  let tabContent = null;
  if (activeTab === "overview") {
    tabContent = (
      <>
        <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader className="pb-6">
              <CardTitle>What you&apos;ll learn</CardTitle>
              <CardDescription>
                Skills, projects, and frameworks you&apos;ll master this cohort.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 sm:grid-cols-2">
                {meta.learning.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-6">
              <CardTitle>Requirements</CardTitle>
              <CardDescription>What we recommend before joining.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {meta.requirements.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 text-blue-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="flex flex-wrap justify-start gap-2 bg-muted/40 p-2">
            <Badge variant="outline" className="bg-white/70 text-xs">
              Video lessons ({videos.length})
            </Badge>
            <Badge variant="outline" className="bg-white/70 text-xs">
              Resources ({resources.length})
            </Badge>
          </div>
          <div className="mt-4 space-y-3">
            {videos.length ? (
              videos.map((video, index) => {
                const previewAvailable = isAuthenticated && index === 0;
                const locked = !hasCourseAccess && !previewAvailable;
                return (
                  <Card key={video.id} className="border-muted/70">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-base">{video.title}</CardTitle>
                        <CardDescription>
                          {Math.ceil(video.duration / 60)} min video
                        </CardDescription>
                      </div>
                      {locked ? (
                        <Button variant="outline" size="sm" disabled>
                          <Lock className="mr-2 h-4 w-4" />
                          {isAuthenticated ? "Enroll to unlock" : "Log in to unlock"}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          <Play className="mr-2 h-4 w-4" />
                          Watch lesson
                        </Button>
                      )}
                    </CardHeader>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-6 text-sm text-muted-foreground">
                  Video lessons will appear here once the cohort launches.
                </CardContent>
              </Card>
            )}
          </div>
          <div className="mt-6 space-y-3">
            {resources.length ? (
              resources.map((resource) => {
                const locked = !hasCourseAccess;
                return (
                  <Card key={resource.id} className="border-muted/70">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-base">{resource.title}</CardTitle>
                        <CardDescription>Downloadable PDF reference</CardDescription>
                      </div>
                      {locked ? (
                        <Button variant="outline" size="sm" disabled>
                          <Lock className="mr-2 h-4 w-4" />
                          {isAuthenticated ? "Enroll to download" : "Log in to download"}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" asChild>
                          <a href={resource.url} target="_blank" rel="noreferrer">
                            <Download className="mr-2 h-4 w-4" /> Download
                          </a>
                        </Button>
                      )}
                    </CardHeader>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-6 text-sm text-muted-foreground">
                  Resources for this course will be unlocked after the first sprint.
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Assessment & certification</CardTitle>
              <CardDescription>
                Complete the capstone assessment to unlock a verified Supernova
                certificate.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3 text-sm text-muted-foreground">
                {courseAssessment ? (
                  <>
                    <p className="font-medium text-foreground">{courseAssessment.title}</p>
                    <p>
                      {courseAssessment.questionCount} questions · Pass score{" "}
                      {courseAssessment.passScore}% · {courseAssessment.attempts} attempts
                      included
                    </p>
                    <p>
                      Schedule with your mentor once you finish the video lessons and
                      resources.
                    </p>
                  </>
                ) : (
                  <p>Assessment details will be announced closer to graduation.</p>
                )}
                <p>
                  Certificates are issued within 48 hours of scoring the passing grade
                  and clearing manual review.
                </p>
                {hasCourseAccess ? (
                  <p className="text-sm font-medium text-primary">
                    You're ready for the assessment when you finish the lessons.
                  </p>
                ) : null}
              </div>
              <div className="space-y-4 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Assessment fee: $49
                </p>
                {/* <Button className="w-full" size="lg" onClick={handleEnroll}>
                  Go to payment
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/enroll/${course.id}`}>Need preparation support?</Link>
                </Button> */}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQs</CardTitle>
              <CardDescription>Quick answers before you commit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>How long will I have access?</strong> Your cohort retains videos,
                PDFs, and mentor notes for 12 months after graduation.
              </p>
              <p>
                <strong>Can I defer my assessment?</strong> Yes. Let your mentor know and
                we will move you to the next assessment window.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Need help deciding?</CardTitle>
              <CardDescription>
                Talk to our team about fit, scholarships, or corporate billing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link to="/contact-us">Chat with us</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </>
    );
  } else if (activeTab === "curriculum") {
    tabContent = (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900">Course Curriculum</h2>
          <p className="text-sm text-slate-500">
            Follow the guided path designed with weekly milestones and mentor checkpoints.
          </p>
        </div>
        <div className="space-y-5">
          {(meta.curriculum ?? []).map((module) => (
            <Card key={module.title} className="border-slate-100 bg-slate-50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-slate-900">{module.title}</CardTitle>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {module.lessons} lessons · {module.hours}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  {module.topics.map((topic) => (
                    <li key={topic} className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-blue-600" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  } else if (activeTab === "instructor") {
    tabContent = (
      <div className="space-y-6">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col gap-6 py-8 md:flex-row md:items-center">
              <img
                src={mentors[0]?.avatarUrl ?? "https://i.pravatar.cc/128?u=instructor"}
                alt={mentors[0]?.name ?? "Instructor portrait"}
                className="h-24 w-24 flex-none rounded-full object-cover shadow-md"
              />
              <div className="space-y-3 text-sm text-slate-600">
                <div>
                  <p className="text-xl font-semibold text-slate-900">
                    {mentors[0]?.name ?? "Supernova Mentor Team"}
                  </p>
                  <p>
                    {mentors[0]?.bio ??
                      "Senior instructor with deep industry experience mentoring learners across modern product teams."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9 instructor rating
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    {(meta.students ?? 0).toLocaleString()} students
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Layers className="h-4 w-4 text-violet-500" />
                    {(mentors.length || 1).toString()} mentor courses
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>
    );
  } else if (activeTab === "reviews") {
    tabContent = (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Student Reviews</h2>
            <p className="text-sm text-slate-500">
              What alumni loved most about this cohort experience.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1 text-amber-400">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <Star className="h-4 w-4 text-amber-400" />
            </span>
            4.9 <span className="text-xs text-slate-400">(12,847 reviews)</span>
          </div>
        </div>
        <div className="space-y-6">
          {[
            {
              name: "John Smith",
              avatar: "https://i.pravatar.cc/64?img=47",
              review:
                "Excellent course! The instructor explains everything clearly and the projects are very practical. I landed a full-stack role after graduating.",
              timeAgo: "2 weeks ago",
            },
            {
              name: "Lisa Chen",
              avatar: "https://i.pravatar.cc/64?img=12",
              review:
                "Best investment I made for my career. The curriculum is well-structured and the mentor feedback helped me level up quickly.",
              timeAgo: "1 month ago",
            },
            {
              name: "Mike Johnson",
              avatar: "https://i.pravatar.cc/64?img=33",
              review:
                "Great content with plenty of real-world examples. The accountability pods kept me motivated throughout the cohort.",
              timeAgo: "1 month ago",
            },
          ].map((item) => (
            <div key={item.name} className="flex flex-col gap-3 border-b border-slate-100 pb-6 last:border-b-0">
              <div className="flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-base font-semibold text-slate-900">{item.name}</p>
                  <div className="flex items-center gap-1 text-sm text-amber-400">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <Star className="h-4 w-4 text-amber-400" />
                  </div>
                </div>
                <span className="ml-auto text-xs text-slate-400">{item.timeAgo}</span>
              </div>
              <p className="text-sm text-slate-600">{item.review}</p>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-fit">
          Leave a review
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-[#0b1324] pb-24 pt-16 text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
          <div className="max-w-2xl space-y-4">
            <Badge className="rounded-full bg-blue-700 px-4 py-1 text-xs font-semibold text-white shadow">
              {categoryName}
            </Badge>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              {course.title}
            </h1>
            <p className="text-sm text-slate-200">
              {course.description} Build real-world projects and deploy them to production
              with guidance from seasoned mentors and a collaborative cohort.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-300" />
                {meta.rating.toFixed(1)} ({meta.students.toLocaleString()} students)
              </span>
              <span>
                Created by{" "}
                {mentors.length
                  ? mentors.map((mentor) => mentor.name).join(", ")
                  : "Supernova Mentor Team"}
              </span>
              <span>Last updated {meta.lastUpdated}</span>
              <span className="inline-flex items-center gap-1">
                <Globe className="h-4 w-4 text-slate-300" />
                {meta.language}
              </span>
            </div>
          </div>

          <Card className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl">
            <img
              src={meta.heroImage}
              alt={course.title}
              className="h-40 w-full object-cover"
            />
            <CardContent className="space-y-5 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-semibold text-slate-900">
                      {/* {meta.price} */}
                    </span>
                    {meta.originalPrice ? (
                      <span className="text-sm font-medium text-slate-400 line-through">
                        {meta.originalPrice}
                      </span>
                    ) : null}
                  </div>
                  {meta.discount ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {meta.discount}
                    </span>
                  ) : null}
                </div>
                <Button
                  asChild
                  className="w-full rounded-md bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {/* <Link to={`/checkout/${course.id}`}>Enroll Now</Link> */}
                </Button>
              </div>

              <div className="grid gap-3 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Duration
                  </span>
                  <span className="font-semibold text-slate-900">{meta.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Layers className="h-4 w-4 text-blue-600" />
                    Lessons
                  </span>
                  <span className="font-semibold text-slate-900">{meta.lessons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Users className="h-4 w-4 text-blue-600" />
                    Level
                  </span>
                  <span className="font-semibold text-slate-900">
                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Globe className="h-4 w-4 text-blue-600" />
                    Language
                  </span>
                  <span className="font-semibold text-slate-900">{meta.language}</span>
                </div>
              </div>

              <div className="h-px w-full bg-slate-200" />

              <div className="space-y-2 text-xs text-slate-600">
                <p className="font-semibold text-slate-900">This course includes:</p>
                <ul className="space-y-1">
                  {meta.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <div className="flex flex-wrap gap-6 border-b border-slate-200 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                className={cn(
                  "border-b-2 pb-2 text-sm font-semibold transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700",
                )}
                aria-pressed={activeTab === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div>{tabContent}</div>
        </div>
      </div>
    </div>
  );
}

