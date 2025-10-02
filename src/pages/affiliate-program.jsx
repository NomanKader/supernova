import { Link } from 'react-router-dom';
import { ArrowRight, DollarSign, LineChart, Users } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const benefits = [
  {
    icon: DollarSign,
    title: 'Recurring commissions',
    description: 'Earn up to 25% revenue share on every learner you refer for the lifetime of their subscription.',
  },
  {
    icon: Users,
    title: 'Creative assets',
    description: 'Access curated banners, copy blocks and launch kits that make promoting Supernova effortless.',
  },
  {
    icon: LineChart,
    title: 'Performance analytics',
    description: 'Track clicks, conversions and payouts in real time with transparent dashboards.',
  },
];

export default function AffiliateProgramPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-14 px-4 md:px-6">
      <section className="rounded-3xl border bg-card px-6 py-12 text-center shadow-sm md:px-12">
        <Badge className="mb-4" variant="outline">
          Partner with us
        </Badge>
        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-5xl">
          Share Supernova and get rewarded for empowering every learner.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
          Join our global network of creators, educators and SaaS leaders earning competitive commissions while
          helping teams unlock modern learning experiences.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg">Apply now</Button>
          <Button size="lg" variant="ghost" asChild>
            <Link to="/contact-us">
              Talk with partnerships <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {benefits.map((benefit) => (
          <Card key={benefit.title}>
            <CardHeader className="space-y-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <benefit.icon className="h-5 w-5 text-primary" />
              </span>
              <CardTitle>{benefit.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{benefit.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>How the program works</CardTitle>
            <CardDescription>Fast approvals, clear tiers and monthly payouts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              1. Submit your application and share how you plan to promote Supernova.
            </p>
            <Separator />
            <p>
              2. Receive your unique referral link along with ready-to-share creative assets.
            </p>
            <Separator />
            <p>
              3. Earn recurring commissions for every customer that stays subscribed.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stay in the loop</CardTitle>
            <CardDescription>Get updates when we open new commission tiers and invite-only launches.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="partner-name">Name</Label>
                <Input id="partner-name" name="name" placeholder="Jordan Smith" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner-email">Work email</Label>
                <Input id="partner-email" type="email" name="email" placeholder="you@example.com" />
              </div>
              <Button type="submit" className="w-full">
                Notify me
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

