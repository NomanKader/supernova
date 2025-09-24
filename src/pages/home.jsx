import * as React from 'react';
import { ArrowRight, Clock, GraduationCap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { courses, promotions } from '@/data/mock-data';

const highlights = [
  {
    icon: GraduationCap,
    title: 'Mentor-led programs',
    description: 'Weekly live reviews and async support to accelerate outcomes.',
  },
  {
    icon: Users,
    title: 'Peer accountability',
    description: 'Tight-knit cohorts with learning circles that ship together.',
  },
  {
    icon: Clock,
    title: 'Flexible schedules',
    description: 'Self-paced modules paired with weekend intensives and clinics.',
  },
];

const featuredCourses = courses.slice(0, 3);
const livePromotion = promotions.find((promo) => promo.status === 'live');

export default function HomePage() {
  return (
    <div className="space-y-16 py-12">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 text-center md:flex-row md:items-center md:text-left">
        <div className="space-y-6 md:w-1/2">
          <Badge variant="secondary" className="text-sm">
            Community-first learning platform
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Launch your next chapter with mentor-guided cohort programs.
          </h1>
          <p className="text-lg text-muted-foreground">
            Supernova helps ambitious learners build real products, collaborate with industry mentors, and earn credentials that open doors.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/register" className="flex items-center gap-2">
                Join the next cohort <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/courses">Browse courses</Link>
            </Button>
          </div>
          {livePromotion ? (
            <p className="text-sm text-muted-foreground">
              Hot right now: {livePromotion.title} — {livePromotion.description}
            </p>
          ) : null}
        </div>
        <div className="grid w-full flex-1 grid-cols-2 gap-4 md:w-1/2">
          {featuredCourses.map((course) => (
            <Card key={course.id} className="border-primary/20 bg-card/60 backdrop-blur">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {course.level} level - {course.lessons} lessons
                </span>
                <span>{course.enrollments} learners enrolled</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title} className="border-muted">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl space-y-6 px-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold">Upcoming cohorts</h2>
            <p className="text-sm text-muted-foreground">Reserve your seat and receive onboarding materials instantly.</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/courses">View all courses</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="flex h-full flex-col">
              <CardHeader className="space-y-2">
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex flex-col gap-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide">
                  <span>{course.level}</span>
                  <span>{course.lessons} lessons</span>
                </div>
                <div className="flex flex-col gap-2">
                  <Button asChild>
                    <Link to={`/courses/${course.id}`}>View course</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={`/checkout/${course.id}`}>Enroll now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

