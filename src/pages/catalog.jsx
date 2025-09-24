import * as React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { courses, categories } from '@/data/mock-data';

const filters = ['all', ...categories.map((category) => category.id)];

export default function CoursesPage() {
  const [tab, setTab] = React.useState('all');

  const visibleCourses = React.useMemo(() => {
    if (tab === 'all') return courses;
    return courses.filter((course) => course.categoryId === tab);
  }, [tab]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-12">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Choose your next learning sprint</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Curated courses designed with industry mentors. Every cohort ships a portfolio project, assessment, and certificate opportunity.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="flex flex-wrap justify-center gap-2 bg-muted/50 p-1">
          {filters.map((value) => {
            const label = value === 'all' ? 'All tracks' : categories.find((c) => c.id === value)?.name ?? value;
            return (
              <TabsTrigger key={value} value={value} className="px-4 py-2">
                {label}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <TabsContent value={tab} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleCourses.map((course) => (
              <Card key={course.id} className="flex h-full flex-col border-muted">
                <CardHeader className="space-y-2">
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-4 text-sm text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide">
                    <Badge variant="secondary">{course.level}</Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {course.lessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> {course.targetReferrals} day roadmap
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>{course.enrollments} alumni</span>
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <FileText className="h-3.5 w-3.5" /> Assessment included
                    </span>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

