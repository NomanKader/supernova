import { Award, Lightbulb, ShieldCheck, Users2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Timeline from '@/components/TimelineComponent';

const heroBackgroundImage =
  'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80';

const coreValues = [
  {
    title: 'Innovation',
    description: 'We constantly evolve our platform and curriculum to deliver cutting-edge learning experiences.',
    icon: Lightbulb,
  },
  {
    title: 'Accessibility',
    description: 'Quality education should be available to everyone, regardless of location or background.',
    icon: ShieldCheck,
  },
  {
    title: 'Excellence',
    description: 'We maintain the highest standards in instruction, support, and learner outcomes.',
    icon: Award,
  },
  {
    title: 'Community',
    description: 'Learning is better together, so we foster a supportive community of learners and mentors.',
    icon: Users2,
  },
];

const leadershipTeam = [
  {
    name: 'Dr. Sarah Mitchell',
    title: 'CEO & Founder',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=480&q=80',
    bio: 'Former Stanford professor with 15+ years in educational technology. Passionate about democratizing quality education.',
  },
  {
    name: 'Michael Rodriguez',
    title: 'CTO',
    image: 'https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?auto=format&fit=crop&w=480&q=80',
    bio: 'Ex-Google engineer specializing in scalable learning platforms. Expert in AI-driven educational solutions.',
  },
  {
    name: 'Emily Chen',
    title: 'Head of Content',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=480&q=80',
    bio: 'Award-winning curriculum designer with expertise in creating engaging, industry-relevant course material.',
  },
  {
    name: 'David Thompson',
    title: 'Head of Student Success',
    image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=480&q=80',
    bio: 'Dedicated to ensuring every student achieves their learning goals through personalized support and mentorship.',
  },
];

const journeyMilestones = [
  { year: '2018', description: 'Supernova founded with a vision to transform online education.' },
  { year: '2019', description: 'Launched our first 10 courses with industry expert instructors.' },
  { year: '2020', description: 'Reached 10,000 students and expanded to mobile learning.' },
  { year: '2021', description: 'Introduced AI-powered personalized learning paths.' },
  { year: '2022', description: 'Partnered with Fortune 500 companies for corporate training.' },
  { year: '2023', description: 'Achieved 50,000 active learners and a 95% completion rate.' },
];

const highlightStats = [
  { value: '50,000+', label: 'Students Worldwide' },
  { value: '200+', label: 'Expert Courses' },
  { value: '95%', label: 'Completion Rate' },
  { value: '150+', label: 'Industry Partners' },
];

export default function AboutUsPage() {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <section className="relative overflow-hidden text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBackgroundImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-700/80 to-blue-600/80" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-20 text-center md:py-24">
          <span className="rounded-full bg-white/10 px-4 py-1 text-sm font-medium tracking-wide">
            About Supernova
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            We&apos;re on a mission to make world-class education accessible to everyone, everywhere.
          </h1>
          <p className="max-w-2xl text-lg text-white/80">
            Join us in transforming lives through the power of learning. Supernova brings together
            expert mentors, practical projects, and a thriving community to help learners reach
            their full potential.
          </p>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 md:flex-row md:items-center">
        <div className="md:w-1/2">
          <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">Our Mission</h2>
          <p className="mt-6 text-lg text-slate-600">
            At Supernova, we believe that education is the most powerful tool for personal and
            professional transformation. Our mission is to democratize access to high-quality,
            industry-relevant education that empowers individuals to achieve their career goals and
            unlock their full potential.
          </p>
          <p className="mt-4 text-lg text-slate-600">
            We partner with industry experts and leading professionals to create courses that bridge
            the gap between traditional education and real-world skills. Every course is designed
            with practical applications, hands-on projects, and career-focused outcomes.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl shadow-lg md:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80"
            alt="Learners collaborating"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </section>

      <section className="bg-[#eaf2ff] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-semibold text-slate-900 md:text-4xl">
            Our Core Values
          </h2>
          <p className="mt-4 text-center text-slate-600">
            The principles that guide everything we do at Supernova.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {coreValues.map(({ title, description, icon: Icon }) => (
              <Card
                key={title}
                className="border-none bg-white text-center shadow-md shadow-blue-100 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-xl">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base text-slate-600">{description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Meet Our Leadership Team
          </h2>
          <p className="mt-4 text-slate-600">
            Passionate educators and technologists dedicated to your success.
          </p>
        </div>
        <div className="mt-12 grid gap-10 md:grid-cols-4">
          {leadershipTeam.map((member) => (
            <Card
              key={member.name}
              className="border-none bg-white text-center shadow-md shadow-slate-100"
            >
              <CardHeader className="flex flex-col items-center gap-4 pt-8">
                <div
                  className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-md shadow-slate-200"
                  style={{ aspectRatio: '1 / 1' }}
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold text-slate-900">{member.name}</CardTitle>
                  <p className="text-sm font-medium text-blue-600">{member.title}</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-slate-600">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-semibold text-slate-900 md:text-4xl">
            Our Journey
          </h2>
          <p className="mt-4 text-center text-slate-600">
            Key milestones in our mission to transform education.
          </p>
          <Timeline className="mt-12" items={journeyMilestones} />
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 py-16 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            {highlightStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/10 p-6 backdrop-blur">
                <div className="text-3xl font-semibold">{stat.value}</div>
                <p className="mt-2 text-sm uppercase tracking-wide text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
          Ready to Join Our Learning Community?
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Start your journey with Supernova today and unlock your potential with our expert-led
          courses.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {/* <Button size="lg" asChild>
            <a href="/courses">Browse Courses</a>
          </Button> */}
          <Button size="lg" variant="outline" asChild>
            <a href="/contact-us">Contact Us</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
