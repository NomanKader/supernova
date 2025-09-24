import { Check, Globe, Layers } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { aboutPageBlocks, users } from '@/data/mock-data';

const stats = [
  { label: 'Alumni hired', value: '1.5k+' },
  { label: 'Mentors & faculty', value: `${users.filter((user) => user.role !== 'student').length}+` },
  { label: 'Cities represented', value: '20' },
];

export default function AboutUsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-12">
      <section className="space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">We build momentum for lifelong learners</h1>
        <p className="mx-auto max-w-3xl text-muted-foreground">
          Supernova is a learning collective powered by mentors, alumni, and partner companies. We design programs that close skill gaps fast and celebrate every milestone along the way.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-muted text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-semibold">{stat.value}</CardTitle>
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {aboutPageBlocks.map((block) => (
          <Card key={block.id}>
            <CardHeader className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                {block.id === 'about-vision' ? <Globe className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
              </div>
              <div>
                <CardTitle>{block.title}</CardTitle>
                <CardDescription>Updated {new Date(block.updatedAt).toLocaleDateString()}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{block.content}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How we operate</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            'Learner-obsessed: we co-create roadmaps with each cohort.',
            'Visibility: mentors provide transparent feedback every sprint.',
            'Equity: scholarships and flexible schedules keep doors open.',
            'Partnerships: we collaborate with hiring managers on curriculum.',
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
              <Check className="mt-1 h-4 w-4 text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
