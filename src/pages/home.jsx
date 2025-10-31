﻿import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Clock,
  MessageCircle,
  PlayCircle,
  Smartphone,
  UserCheck,
} from 'lucide-react';
import heroBackground from '@/assets/backgroundImage.jpg';
import courseImage1 from '@/assets/course1.png';
import courseImage2 from '@/assets/course2.png';
import courseImage3 from '@/assets/course3.png';

const stats = [
  { number: '50,000+', label: 'Active Students' },
  { number: '200+', label: 'Certified Instructors' },
  { number: '1,500+', label: 'Hours of Content' },
  { number: '95%', label: 'Completion Success' },
];

const features = [
  {
    icon: PlayCircle,
    title: 'Interactive Video Lessons',
    description: 'Engage with industry experts through cinematic, chapter-based video sessions.',
  },
  {
    icon: Award,
    title: 'Industry Certifications',
    description: 'Graduate with accredited certificates that unlock promotions and new roles.',
  },
  {
    icon: UserCheck,
    title: 'Expert Mentorship',
    description: 'Join weekly mentor clinics and get 1:1 feedback tailored to your goals.',
  },
  {
    icon: Clock,
    title: 'Flexible Learning',
    description: 'Learn on your schedule with always-on mobile access and offline downloads.',
  },
  {
    icon: MessageCircle,
    title: 'Community Support',
    description: 'Connect with global peers in moderated study lounges and project squads.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description: 'Pick up where you left off with synced progress across any device.',
  },
];

const featuredCourses = [
  {
    category: 'Development',
    title: 'Full Stack Web Development',
    instructor: 'Sarah Johnson',
    rating: 4.9,
    students: 12847,
    price: 89,
    image: courseImage1,
  },
  {
    category: 'Marketing',
    title: 'Digital Marketing Mastery',
    instructor: 'Michael Chen',
    rating: 4.8,
    students: 9563,
    price: 79,
    image: courseImage2,
  },
  {
    category: 'Data Science',
    title: 'Data Science & Analytics',
    instructor: 'Dr. Emily Rodriguez',
    rating: 4.9,
    students: 8234,
    price: 99,
    image: courseImage3,
  },
];

const testimonials = [
  {
    name: 'Alex Thompson',
    role: 'Software Engineer at Google',
    content:
      'Supernova transformed my career. The learning paths are structured, the mentors are real practitioners, and the job support was a game changer.',
    avatar:
      'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20confident%20young%20male%20software%20engineer%20with%20friendly%20smile%2C%20clean%20bright%20cyan%20background%2C%20business%20casual%20attire%2C%20modern%20professional%20portrait%20style&width=80&height=80&seq=testimonial1&orientation=squarish',
  },
  {
    name: 'Maria Garcia',
    role: 'Digital Marketing Manager',
    content:
      'The capstone projects and peer feedback helped me build a portfolio that stands out. I secured a promotion within three months.',
    avatar:
      'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20confident%20young%20female%20marketing%20professional%20with%20warm%20smile%2C%20clean%20bright%20cyan%20background%2C%20business%20attire%2C%20modern%20professional%20portrait%20style&width=80&height=80&seq=testimonial2&orientation=squarish',
  },
  {
    name: 'David Kim',
    role: 'Data Analyst at Microsoft',
    content:
      'I loved the flexibility and accountability. The analytics projects mapped perfectly to real-world dashboards we use on the job.',
    avatar:
      'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20confident%20young%20male%20data%20analyst%20with%20glasses%20and%20friendly%20expression%2C%20clean%20bright%20cyan%20background%2C%20business%20casual%20shirt%2C%20modern%20professional%20portrait%20style&width=80&height=80&seq=testimonial3&orientation=squarish',
  },
];

function RatingStar({ fill }) {
  return (
    <span className="relative inline-block h-4 w-4 leading-none">
      <span className="absolute inset-0 text-gray-300">&#9733;</span>
      {fill > 0 && (
        <span
          className="absolute inset-0 overflow-hidden text-yellow-400"
          style={{ width: `${fill * 100}%` }}
        >
          &#9733;
        </span>
      )}
    </span>
  );
}

function renderRating(rating) {
  const stars = [];
  for (let i = 0; i < 5; i += 1) {
    const rawFill = Math.max(0, Math.min(1, rating - i));
    const fill = rawFill >= 0.75 ? 1 : rawFill >= 0.25 ? 0.5 : 0;
    stars.push(<RatingStar key={i} fill={fill} />);
  }
  return stars;
}

export default function HomePage() {
  const heroBackgroundStyle = {
    backgroundImage: `linear-gradient(135deg, rgba(14, 165, 233, 0.88), rgba(59, 130, 246, 0.88)), url(${heroBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: '#0ea5e9',
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main>
        <section
          className="relative overflow-hidden text-white"
          style={heroBackgroundStyle}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_55%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:flex lg:items-center lg:gap-16 lg:px-8 lg:py-20">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                Transform your future with
                <span className="block text-yellow-300">expert-led cohort programs.</span>
              </h1>
              <p className="max-w-xl text-lg text-cyan-50">
                Build job-ready skills with immersive projects, live mentorship, and a global community
                cheering for your success.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a 
                  href="#whysupernova"
                  className="flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 text-base font-semibold text-cyan-600 shadow-xl shadow-cyan-900/30 transition hover:-translate-y-0.5 hover:bg-cyan-50"
                >
                  {/* Start learning today */}
                  Why SuperNova ?
                  <ArrowUpRight className="h-5 w-5" />
                </a>
                <a
                  href="#courses"
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/60 px-8 py-3 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Explore courses
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-cyan-100/90">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-yellow-300" />
                  100% job-focused curriculum
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-yellow-300" />
                  Live mentor feedback
                </div>
              </div>
            </div>

            {/* Removed secondary hero cards per latest design */}
          </div>
        </section>

        <section className="bg-gradient-to-r from-cyan-50 to-blue-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent">
                    {stat.number}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span id='whysupernova' className="text-sm font-semibold uppercase tracking-wide text-cyan-600">
                Why Supernova
              </span>
              <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Everything you need to stay ahead of the curve
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                From interactive labs to career coaching, we designed every detail to help you thrive.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-600 transition group-hover:from-cyan-200 group-hover:to-blue-200">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-gray-900">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-cyan-50 to-blue-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-semibold uppercase tracking-wide text-cyan-600">
                Featured Courses
              </span>
              <h2 id='courses' className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Discover our most upcoming courses
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Explore flagship programs that combine expert instruction, hands-on projects, and
                community accountability to accelerate your growth.
              </p>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {featuredCourses.map((course) => (
                <div
                  key={course.title}
                  className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative">
                    <img
                      src={course.image}
                      alt={course.title}
                      loading="lazy"
                      className="h-48 w-full object-cover"
                    />
                    <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      {course.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">by {course.instructor}</p>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5">{renderRating(course.rating)}</span>
                        <span className="text-gray-500">({course.rating.toFixed(1)})</span>
                      </span>
                      {/* <span>{course.students.toLocaleString()} students</span> */}
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      {/* <span className="text-2xl font-semibold text-blue-600">${course.price}</span> */}
                        {/* <Link
                          to={`/courses`}
                          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:from-cyan-600 hover:to-blue-700"
                        >
                          Enroll Now
                        </Link> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* <div className="mt-12 flex justify-center">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-full border-2 border-blue-500 px-6 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                View all courses
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div> */}
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-sm font-semibold uppercase tracking-wide text-cyan-600">
                Success stories
              </span>
              <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Learners who accelerated their careers
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Hear how Supernova alumni landed promotions, transitioned careers, and launched new ventures.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="flex h-full flex-col rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 p-8 shadow-lg shadow-cyan-100 transition hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      loading="lazy"
                      className="h-12 w-12 rounded-full object-cover object-top"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{testimonial.name}</h3>
                      <p className="text-sm font-medium text-cyan-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="mt-6 flex-1 text-sm leading-relaxed text-gray-700">
                    "{testimonial.content}"
                  </p>
                  {/* <Link
                    to="/promotions"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 transition hover:text-blue-600"
                  >
                    See their pathway
                    <ArrowRight className="h-4 w-4" />
                  </Link> */}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 py-20 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />
          <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
              Ready to start your learning journey?
            </h2>
            <p className="max-w-2xl text-lg text-cyan-100">
              Join tens of thousands of learners who have advanced their careers with Supernova. Your next
              chapter starts today.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* <Link
                to="/get-started"
                className="flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 text-base font-semibold text-cyan-600 shadow-xl shadow-cyan-900/30 transition hover:-translate-y-0.5 hover:bg-cyan-50"
              >
                Start free trial
                <ArrowUpRight className="h-5 w-5" />
              </Link> */}
              {/* <Link
                to="/courses"
                className="flex items-center justify-center gap-2 rounded-lg border border-white/70 px-8 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Browse courses
              </Link> */}
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}










