import { Link } from 'react-router-dom';
import { CalendarRange, Megaphone, Rocket, Target } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const channels = [
  {
    icon: Megaphone,
    title: 'Campaign announcements',
    description:
      'Launch new course tracks or seasonal bundles across email, in-app banners and social channels with one click.',
  },
  {
    icon: CalendarRange,
    title: 'Always-on drip series',
    description:
      'Nurture learners with automated onboarding and re-engagement journeys that reinforce course value.',
  },
  {
    icon: Target,
    title: 'Segmented offers',
    description:
      'Deliver targeted incentives by cohort, completion rate or subscription tier to keep learners progressing.',
  },
];

const highlights = [
  'Centralize all promotions in a single calendar view with real-time status updates.',
  'Reuse proven templates to speed up go-to-market and stay on brand.',
  'Measure enrollment and revenue impact with built-in analytics dashboards.',
];

export default function MarketingPromotionsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-16 px-4 md:px-6">
      <section className="rounded-3xl border bg-gradient-to-br from-primary/5 via-background to-background p-10 text-center">
        <Badge className="mb-4" variant="secondary">
          Campaign Ops
        </Badge>
        <h1 className="mx-auto max-w-2xl text-balance text-4xl font-bold tracking-tight md:text-5xl">
          Run coordinated promotions that keep learners coming back.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
          Package course launches, flash sales and progress nudges into a single command center that helps your team
          move faster and stay aligned.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/register">Start free trial</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/contact-us">Talk to sales</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {channels.map((channel) => (
          <Card key={channel.title}>
            <CardHeader className="space-y-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <channel.icon className="h-5 w-5 text-primary" />
              </span>
              <CardTitle>{channel.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{channel.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Why teams choose Supernova promotions</CardTitle>
            <CardDescription>Purpose-built workflows for growth, retention and community activation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {highlights.map((highlight) => (
              <div key={highlight} className="flex items-start gap-3">
                <Rocket className="mt-1 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">{highlight}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-muted/40">
          <CardHeader>
            <CardTitle>Launch timeline</CardTitle>
            <CardDescription>Stay on track with milestone reminders for every campaign.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {['Ideate offer', 'Build creative', 'QA & approvals', 'Go live', 'Measure impact'].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold', {
                  'bg-primary text-primary-foreground': index === 0,
                })}>
                  {index + 1}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

