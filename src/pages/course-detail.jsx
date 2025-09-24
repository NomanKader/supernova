import { Download, Lock, Play, ShieldCheck } from 'lucide-react';
import * as React from 'react';
import { Link, Navigate, useParams, useNavigate } from 'react-router-dom';

import { useAuth } from '@/components/marketing/auth-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { courses, lessonAssets, assessments, users } from '@/data/mock-data';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isSubscribed, purchasedCourses } = useAuth();

  const course = courses.find((item) => item.id === courseId);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [courseId]);

  const { videos, resources, mentors, courseAssessment } = React.useMemo(() => {
    if (!course) {
      return { videos: [], resources: [], mentors: [], courseAssessment: undefined };
    }
    const relatedAssets = lessonAssets.filter((asset) => asset.courseId === course.id);
    return {
      videos: relatedAssets.filter((asset) => asset.type === 'video'),
      resources: relatedAssets.filter((asset) => asset.type === 'pdf'),
      mentors: users.filter((user) => course.instructorIds?.includes(user.id)),
      courseAssessment: assessments.find((assessment) => assessment.courseId === course.id),
    };
  }, [course]);

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  const hasCourseAccess = isSubscribed || purchasedCourses?.includes(course.id);

  const handleEnroll = () => {
    navigate(`/checkout/${course.id}`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-12">
      <section className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <Badge variant="secondary" className="text-xs uppercase tracking-wide">
            {course.level} level
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground">{course.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>{course.lessons} lessons</span>
            <span>{course.enrollments} alumni</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={handleEnroll}>
              Enroll in this course
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="#assessment">Assessment & certificate</Link>
            </Button>
          </div>
          {!isAuthenticated ? (
            <p className="text-sm text-muted-foreground">
              Log in to preview lesson one and see what’s included.
            </p>
          ) : hasCourseAccess ? (
            <p className="text-sm text-muted-foreground">You have full access to this course. Enjoy the lessons!</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              You can watch the first lesson now. Complete enrollment to unlock the full video library, resources, and assessments.
            </p>
          )}
        </div>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Meet your mentors</CardTitle>
            <CardDescription>Guides with real product experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {mentors.length ? (
              mentors.map((mentor) => (
                <div key={mentor.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium text-foreground">{mentor.name}</p>
                    <p className="text-xs uppercase tracking-wide">{mentor.role}</p>
                  </div>
                  <Badge variant="secondary">{mentor.status}</Badge>
                </div>
              ))
            ) : (
              <p>No mentors assigned yet.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="flex flex-wrap justify-start gap-2 bg-muted/40">
            <TabsTrigger value="videos">Video lessons ({videos.length})</TabsTrigger>
            <TabsTrigger value="resources">Resources ({resources.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="videos" className="mt-4 space-y-3">
            {videos.length ? (
              videos.map((video, index) => {
                const previewAvailable = isAuthenticated && index === 0;
                const locked = !hasCourseAccess && (!previewAvailable);
                return (
                  <Card key={video.id} className="border-muted/70">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-base">{video.title}</CardTitle>
                        <CardDescription>
                          {video.duration ? `${Math.round(video.duration / 60)} minutes` : 'On-demand session'}
                        </CardDescription>
                      </div>
                      {locked ? (
                        <Button variant="outline" size="sm" disabled>
                          <Lock className="mr-2 h-4 w-4" />
                          {isAuthenticated ? 'Enroll to unlock' : 'Log in to unlock'}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" asChild>
                          <a href={video.url} target="_blank" rel="noreferrer">
                            <Play className="mr-2 h-4 w-4" /> Watch
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
                  New lessons are being produced for this cohort. Check back soon!
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="resources" className="mt-4 space-y-3">
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
                          {isAuthenticated ? 'Enroll to download' : 'Log in to download'}
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
          </TabsContent>
        </Tabs>
      </section>

      <section id="assessment" className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Assessment & certification</CardTitle>
            <CardDescription>
              Complete the capstone assessment to unlock a verified Supernova certificate.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 text-sm text-muted-foreground">
              {courseAssessment ? (
                <>
                  <p className="font-medium text-foreground">{courseAssessment.title}</p>
                  <p>
                    {courseAssessment.questionCount} questions • Pass score {courseAssessment.passScore}% • {courseAssessment.attempts} attempts included
                  </p>
                  <p>Schedule with your mentor once you finish the video lessons and resources.</p>
                </>
              ) : (
                <p>Assessment details will be announced closer to graduation.</p>
              )}
              <p>
                Certificates are issued within 48 hours of scoring the passing grade and clearing manual review.
              </p>
              {hasCourseAccess ? (
                <p className="text-sm font-medium text-primary">✅ You’re ready for the assessment when you finish the lessons.</p>
              ) : null}
            </div>
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" /> Assessment fee: $49
              </p>
              <Button className="w-full" size="lg" onClick={handleEnroll}>
                Go to payment
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/enroll/${course.id}`}>Need preparation support?</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
            <CardDescription>Quick answers before you commit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>How long will I have access?</strong> Your cohort retains videos, PDFs, and mentor notes for 12 months after graduation.
            </p>
            <p>
              <strong>Can I defer my assessment?</strong> Yes. Let your mentor know and we will move you to the next assessment window.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Need help deciding?</CardTitle>
            <CardDescription>Talk to our team about fit, scholarships, or corporate billing.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link to="/contact-us">Chat with us</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}



