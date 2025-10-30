import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  Layers,
  Play,
  Star,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { categories, courses, users } from '@/data/mock-data';
import { cn } from '@/lib/utils';

const courseMeta = {
  'c-001': {
    heroImage:
      'https://images.unsplash.com/photo-1526481280695-3c4692f07e87?auto=format&fit=crop&w=1600&q=80',
    price: '$89',
    originalPrice: '$129',
    discount: '31% off',
    duration: '40 hours',
    lessons: 156,
    language: 'English',
    lastUpdated: 'December 2024',
    rating: 4.9,
    students: 12847,
    includes: ['40 hours on-demand video', 'Downloadable resources', 'Access on mobile and TV', 'Certificate of completion'],
    curriculum: [
      {
        title: 'Frontend Fundamentals',
        lessons: 25,
        hours: '8 hours',
        topics: ['HTML5 & Semantic Markup', 'CSS3 & Flexbox/Grid', 'JavaScript ES6+', 'Responsive Design'],
      },
      {
        title: 'React Development',
        lessons: 35,
        hours: '12 hours',
        topics: ['Components & JSX', 'State & Props', 'Hooks & Context', 'React Router'],
      },
      {
        title: 'Backend Development',
        lessons: 40,
        hours: '15 hours',
        topics: ['Node.js Fundamentals', 'Express.js Framework', 'RESTful APIs', 'Authentication'],
      },
      {
        title: 'Database & Deployment',
        lessons: 30,
        hours: '10 hours',
        topics: ['MongoDB Basics', 'Database Design', 'Cloud Deployment', 'DevOps Basics'],
      },
    ],
    learning: [
      'Build responsive websites with HTML, CSS, and JavaScript.',
      'Create RESTful APIs with Node.js and Express.',
      'Deploy applications to cloud platforms.',
      'Use Git for version control and collaboration.',
      'Master React.js and modern frontend development workflows.',
      'Work with MongoDB and database design best practices.',
      'Implement authentication and security patterns.',
      'Apply modern deployment pipelines and tooling.',
    ],
    requirements: [
      'Basic computer skills and internet access.',
      'No prior programming experience required.',
      'Willingness to learn and practice coding.',
      'A computer with at least 4GB RAM.',
    ],
  },
  'c-002': {
    heroImage:
      'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1600&q=80',
    price: '$79',
    originalPrice: '$119',
    discount: '34% off',
    duration: '35 hours',
    lessons: 128,
    language: 'English',
    lastUpdated: 'January 2025',
    rating: 4.8,
    students: 9563,
    includes: ['35 hours on-demand video', 'Campaign templates & worksheets', 'Lifetime community access', 'Certificate of completion'],
    curriculum: [
      {
        title: 'Marketing Foundations',
        lessons: 20,
        hours: '6 hours',
        topics: ['Brand Positioning', 'Customer Segmentation', 'Value Proposition Design'],
      },
      {
        title: 'Acquisition Engines',
        lessons: 30,
        hours: '10 hours',
        topics: ['Paid Ads Strategy', 'SEO & Content', 'Referral Loops', 'Campaign Analytics'],
      },
      {
        title: 'Lifecycle & Retention',
        lessons: 25,
        hours: '8 hours',
        topics: ['Email Automation', 'Product Marketing Plays', 'Churn Prevention'],
      },
      {
        title: 'Data & Storytelling',
        lessons: 18,
        hours: '6 hours',
        topics: ['Dashboard Building', 'Cohort Analysis', 'Executive Reporting'],
      },
    ],
    learning: [
      'Design omnichannel marketing funnels that convert.',
      'Build data dashboards to monitor campaign performance.',
      'Master paid acquisition, lifecycle, and retention plays.',
      'Run creative experiments with a documented framework.',
      'Plan and automate email sequences that drive revenue.',
      'Leverage social analytics to inform iteration.',
      'Collaborate with product and sales for go-to-market.',
      'Build an executive marketing report for leadership.',
    ],
    requirements: [
      'Interest in growth, marketing, or communications.',
      'Comfortable with basic spreadsheet skills.',
      'Access to marketing tooling (free trials provided).',
      'Commitment of ~6 hours per week.',
    ],
  },
  'c-003': {
    heroImage:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
    price: '$99',
    originalPrice: '$149',
    discount: '33% off',
    duration: '50 hours',
    lessons: 189,
    language: 'English',
    lastUpdated: 'November 2024',
    rating: 4.9,
    students: 8234,
    includes: ['50 hours on-demand video', 'Production-ready notebooks', 'Model deployment playbook', 'Certificate of completion'],
    curriculum: [
      {
        title: 'Data Foundations',
        lessons: 22,
        hours: '7 hours',
        topics: ['Data Wrangling', 'Feature Engineering', 'Exploratory Analysis'],
      },
      {
        title: 'Model Development',
        lessons: 28,
        hours: '9 hours',
        topics: ['Supervised Learning', 'Model Evaluation', 'Hyperparameter Tuning'],
      },
      {
        title: 'MLOps & Deployment',
        lessons: 24,
        hours: '8 hours',
        topics: ['Pipeline Orchestration', 'Model Serving', 'Monitoring & Alerts'],
      },
      {
        title: 'Applied Capstone',
        lessons: 20,
        hours: '6 hours',
        topics: ['Business Problem Framing', 'Presentation Storytelling', 'Executive Handoff'],
      },
    ],
    learning: [
      'Frame machine learning problems for business stakeholders.',
      'Build reproducible data pipelines with modern tooling.',
      'Train, tune, and evaluate supervised learning models.',
      'Ship models using MLOps and monitoring best practices.',
      'Collaborate with data engineering and product teams.',
      'Translate insights into executive-ready storytelling.',
      'Integrate ethical considerations and bias mitigation.',
      'Launch a capstone end-to-end ML project.',
    ],
    requirements: [
      'Intermediate Python and statistics knowledge.',
      'Familiarity with pandas and basic ML libraries.',
      'Cloud computing access (credits provided).',
      'Availability for weekly mentor office hours.',
    ],
  },
};

const fallbackMeta = {
  heroImage:
    'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1600&q=80',
  price: '$249',
  originalPrice: null,
  discount: null,
  duration: '32 hours',
  lessons: 90,
  language: 'English',
  lastUpdated: 'October 2024',
  rating: 4.8,
  students: 6200,
  includes: ['On-demand video', 'Guided projects', 'Mentor office hours', 'Certificate of completion'],
  curriculum: [
    {
      title: 'Orientation & Foundations',
      lessons: 18,
      hours: '6 hours',
      topics: ['Kickoff & Goal Setting', 'Tooling Setup', 'Baseline Assessment'],
    },
    {
      title: 'Core Skills Lab',
      lessons: 28,
      hours: '9 hours',
      topics: ['Hands-on Workshops', 'Peer Feedback Sessions', 'Project Checkpoints'],
    },
    {
      title: 'Portfolio Sprint',
      lessons: 22,
      hours: '7 hours',
      topics: ['Capstone Planning', 'Mentor Reviews', 'Showcase Prep'],
    },
  ],
  learning: [
    'Learn industry workflows through guided projects.',
    'Collaborate inside a peer accountability pod.',
    'Ship a portfolio-ready capstone.',
    'Adopt best practices to accelerate your craft.',
  ],
  requirements: [
    'Stable internet connection.',
    'Motivation to learn alongside a cohort.',
    'Commitment of 5-6 hours per week.',
  ],
};

export default function EnrollPage() {
  const { courseId } = useParams();
  const course = courses.find((item) => item.id === courseId);
  const meta = course ? { ...fallbackMeta, ...(courseMeta[course.id] ?? {}) } : null;

  const courseCategory =
    categories.find((category) => category.id === course?.categoryId)?.name ?? 'General';
  const leadMentor = users.find((user) => course?.instructorIds?.includes(user.id));
  const levelLabel =
    typeof course?.level === 'string'
      ? course.level.charAt(0).toUpperCase() + course.level.slice(1)
      : 'All Levels';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'instructor', label: 'Instructor' },
  { id: 'reviews', label: 'Reviews' },
];
const [activeTab, setActiveTab] = React.useState('overview');

const instructorProfiles = {
  'u-001': {
    headline:
      'Senior Full Stack Developer with 8+ years building production web applications. Former lead dev at growth-stage startups, now a freelance consultant and mentor helping developers break into the industry.',
    rating: 4.9,
    students: '25,000+',
    courses: 12,
  },
  'u-002': {
    headline:
      'Staff Engineer specialising in TypeScript and testing automation. Coaches teams on scaling quality practices and leading resilient engineering cultures.',
    rating: 4.8,
    students: '18,500+',
    courses: 9,
  },
};

const courseReviews = {
  'c-001': [
    {
      name: 'John Smith',
      avatar: 'https://i.pravatar.cc/64?img=47',
      rating: 5,
      timeAgo: '2 weeks ago',
      content:
        'Excellent course! The live mentor feedback and projects helped me land a full-stack role. Highly recommend for anyone serious about React.',
    },
    {
      name: 'Lisa Chen',
      avatar: 'https://i.pravatar.cc/64?img=12',
      rating: 5,
      timeAgo: '1 month ago',
      content:
        'Best investment I made this year. The curriculum is structured and the accountability pod kept me on track throughout the cohort.',
    },
    {
      name: 'Mike Johnson',
      avatar: 'https://i.pravatar.cc/64?img=33',
      rating: 4,
      timeAgo: '1 month ago',
      content:
        'Great content with practical examples. I would love to see even more advanced deployment topics, but overall it exceeded expectations.',
    },
  ],
  'c-002': [
    {
      name: 'Priya Patel',
      avatar: 'https://i.pravatar.cc/64?img=29',
      rating: 5,
      timeAgo: '3 weeks ago',
      content:
        'The experimentation frameworks we learned here helped me double campaign conversions at work. Super actionable insights.',
    },
    {
      name: 'Victor Nguyen',
      avatar: 'https://i.pravatar.cc/64?img=57',
      rating: 5,
      timeAgo: '1 month ago',
      content:
        'Loved the mix of data storytelling and channel strategy. The mentor feedback on my capstone deck was invaluable.',
    },
  ],
  'c-003': [
    {
      name: 'Amelia Torres',
      avatar: 'https://i.pravatar.cc/64?img=41',
      rating: 5,
      timeAgo: '2 weeks ago',
      content:
        'The applied labs and MLOps focus helped me ship my first production model at work. Highly immersive experience.',
    },
    {
      name: 'Nikhil Rao',
      avatar: 'https://i.pravatar.cc/64?img=16',
      rating: 4,
      timeAgo: '1 month ago',
      content:
        'Fantastic mentor support and relevant datasets. Would enjoy a deeper dive into responsible AI frameworks in future cohorts.',
    },
  ],
};

React.useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setActiveTab('overview');
}, [courseId]);

  if (!course || !meta) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center">
        <CheckCircle2 className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-semibold">Course not found</h1>
        <p className="text-muted-foreground">
          The program you are looking for may have moved or closed enrollment.
        </p>
        <Button asChild>
          <Link to="/courses">Browse catalog</Link>
        </Button>
      </div>
    );
  }

  const mentorProfile = instructorProfiles[leadMentor?.id] ?? {};
  const mentorRating = mentorProfile.rating ?? (meta.rating ?? 4.9);
  const mentorStudents =
    mentorProfile.students ?? `${(meta.students ?? 0).toLocaleString()}+`;
  const mentorCourses = mentorProfile.courses ?? 8;
  const reviews = courseReviews[course.id] ?? [];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-[#0b1324] pb-24 pt-16 text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
          <div className="max-w-2xl space-y-4">
            <Badge className="rounded-full bg-blue-700 px-4 py-1 text-xs font-semibold text-white shadow">
              {courseCategory}
            </Badge>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{course.title}</h1>
            <p className="text-sm text-slate-200">
              {course.description} Build real-world projects and deploy them to production with guidance
              from seasoned mentors and a collaborative cohort.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-300" />
                {meta.rating.toFixed(1)} ({(meta.students ?? course.enrollments ?? 0).toLocaleString()} students)
              </span>
              <span>Created by {leadMentor?.name ?? 'Supernova Mentor Team'}</span>
              <span>Last updated {meta.lastUpdated}</span>
              <span className="inline-flex items-center gap-1">
                <Globe className="h-4 w-4 text-slate-300" />
                {meta.language}
              </span>
            </div>
          </div>

          <Card className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl">
            <img src={meta.heroImage} alt={course.title} className="h-40 w-full object-cover" />
            <CardContent className="space-y-5 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-semibold text-slate-900">{meta.price}</span>
                    {meta.originalPrice ? (
                      <span className="text-sm font-medium text-slate-400 line-through">{meta.originalPrice}</span>
                    ) : null}
                  </div>
                  {meta.discount ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {meta.discount}
                    </span>
                  ) : null}
                </div>
                  {/* <Button asChild className="w-full rounded-md bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700">
                    <Link to={`/checkout/${course.id}`}>Enroll Now</Link>
                  </Button> */}
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
                  <span className="font-semibold text-slate-900">{levelLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Globe className="h-4 w-4 text-blue-600" />
                    Language
                  </span>
                  <span className="font-semibold text-slate-900">{meta.language}</span>
                </div>
              </div>

              <Separator />

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

      <section className="relative -mt-12 bg-white pb-28">
        <div className="mx-auto w-full max-w-6xl rounded-3xl bg-white px-4 py-10 shadow-xl sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-8 border-b border-slate-200 pb-4 text-sm font-semibold text-slate-500">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'border-b-2 pb-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-blue-600',
                )}
                aria-pressed={activeTab === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-10">
            {activeTab === 'overview' ? (
              <div className="grid gap-16 lg:grid-cols-[2fr_1fr]">
                <div className="space-y-12">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">What you&apos;ll learn</h2>
                    <ul className="mt-6 grid gap-4 md:grid-cols-2">
                      {meta.learning.map((point) => (
                        <li key={point} className="flex items-start gap-3 text-sm text-slate-600">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-600" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
                    <h3 className="text-lg font-semibold text-slate-900">Requirements</h3>
                    <ul className="mt-4 space-y-3 text-sm text-slate-600">
                      {meta.requirements.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <ArrowRight className="mt-0.5 h-4 w-4 flex-none text-blue-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 text-sm text-blue-700">
                    <p className="font-semibold">Need help deciding?</p>
                    <p className="mt-2">
                      Talk to our learning concierge for scholarships, team bundles, or scheduling a live info
                      session.
                    </p>
                    <Button asChild variant="outline" className="mt-4 w-full border-blue-400 text-blue-600">
                      <Link to="/contact">Contact concierge</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === 'curriculum' ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-slate-900">Course Curriculum</h2>
                  <p className="text-sm text-slate-500">
                    Follow the guided path designed with weekly milestones, mentor sessions, and accountability pods.
                  </p>
                </div>
                <div className="space-y-5">
                  {(meta.curriculum ?? []).map((module) => (
                    <Card key={module.title} className="border-slate-100 bg-slate-50">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg text-slate-900">{module.title}</CardTitle>
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
            ) : null}

            {activeTab === 'instructor' ? (
              <div className="space-y-6">
                <Card className="border border-slate-200 bg-white shadow-sm">
                  <CardContent className="flex flex-col gap-6 py-8 md:flex-row md:items-center">
                    <img
                      src={leadMentor?.avatarUrl ?? 'https://i.pravatar.cc/128?u=mentor-profile'}
                      alt={leadMentor?.name ?? 'Mentor portrait'}
                      className="h-24 w-24 flex-none rounded-full object-cover shadow-md"
                    />
                    <div className="space-y-3 text-sm text-slate-600">
                      <div>
                        <p className="text-xl font-semibold text-slate-900">
                          {leadMentor?.name ?? 'Supernova Mentor Team'}
                        </p>
                        <p>
                          {mentorProfile.headline ??
                            'Industry mentor guiding you through production-ready workflows and cohort accountability.'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-2">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          {mentorRating} instructor rating
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          {mentorStudents} students
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Layers className="h-4 w-4 text-violet-500" />
                          {mentorCourses} courses taught
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {activeTab === 'reviews' ? (
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
                    {meta.rating.toFixed(1)}{' '}
                    <span className="text-xs text-slate-400">({(meta.students ?? 0).toLocaleString()} reviews)</span>
                  </div>
                </div>
                <div className="space-y-6">
                  {(reviews.length ? reviews : courseReviews['c-001']).map((item) => (
                    <div
                      key={item.name}
                      className="flex flex-col gap-3 border-b border-slate-100 pb-6 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <img src={item.avatar} alt={item.name} className="h-12 w-12 rounded-full object-cover" />
                        <div>
                          <p className="text-base font-semibold text-slate-900">{item.name}</p>
                          <div className="flex items-center gap-1 text-sm text-amber-400">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={`${item.name}-star-${idx}`}
                                className={cn(
                                  'h-4 w-4',
                                  idx < item.rating ? 'fill-amber-400 text-amber-400' : 'text-amber-200',
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-slate-400">{item.timeAgo}</span>
                      </div>
                      <p className="text-sm text-slate-600">{item.content}</p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-fit">
                  Leave a review
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

