import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  PlayCircle,
  UserPlus,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Choose Your Plan',
    description: 'Select the learning package that aligns with your goals and budget.',
    icon: CreditCard,
  },
  {
    number: '02',
    title: 'Create Your Account',
    description: 'Share a few details so we can personalise your learning dashboard.',
    icon: UserPlus,
  },
  {
    number: '03',
    title: 'Start Learning',
    description: 'Jump straight into curated courses and kick off your transformation.',
    icon: PlayCircle,
  },
];

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    period: 'month',
    description: 'Perfect for testing the waters.',
    features: [
      'Access to 50+ core courses',
      'Community discussion access',
      'Mobile app with offline mode',
      'Completion certificates',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    period: 'month',
    description: 'Our most popular tier for serious learners.',
    features: [
      'Full library of 200+ courses',
      'Priority mentor support',
      'Desktop + mobile apps',
      'Verified certificates',
      'Weekly live Q&A sessions',
      'Downloadable resources',
      'Progress analytics',
    ],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    period: 'month',
    description: 'Everything you need plus personalised coaching.',
    features: [
      'Everything in Pro',
      '1:1 mentorship coaching',
      'Career roadmap guidance',
      'Portfolio reviews',
      'Job placement support',
      'Exclusive workshops',
      '24/7 priority assistance',
    ],
  },
];

const faqs = [
  {
    question: 'Can I cancel anytime?',
    answer:
      'Absolutely. Manage your subscription from the dashboard and cancel whenever you need - no hidden fees.',
  },
  {
    question: 'Do you offer a free trial?',
    answer:
      'New members can explore the full platform for 7 days free. Cancel before the trial ends if it is not a fit.',
  },
  {
    question: 'Are certificates recognised by employers?',
    answer:
      'Yes. Supernova certificates are industry-recognised and help demonstrate your commitment to growth.',
  },
  {
    question: 'Can I switch between plans later?',
    answer:
      'You can upgrade or downgrade at any time. Changes take effect on your next billing cycle.',
  },
  {
    question: 'Is there a money-back guarantee?',
    answer:
      'We provide a 30-day money-back guarantee. If you are not satisfied, request a refund - no questions asked.',
  },
];

export default function GetStartedPage() {
  const [selectedPlan, setSelectedPlan] = useState('pro');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="bg-white">
      <section className="bg-gradient-to-r from-cyan-600 to-blue-700 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Start Your Learning Journey Today
          </h1>
          <p className="mt-6 text-lg text-cyan-100 sm:text-xl">
            Join thousands of ambitious learners transforming their careers with Supernova. Pick the
            plan that fits and begin right away.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-cyan-50">
            {[
              { label: 'No setup fees' },
              { label: 'Cancel anytime' },
              { label: '30-day money-back guarantee' },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">
              Getting started takes less than five minutes - follow the steps and you are in.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="rounded-2xl bg-white p-8 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-semibold text-cyan-500">{step.number}</span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-cyan-600">
              Pricing Plans
            </span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Flexible options built for every learner
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Select the plan that fits now - you can change or cancel anytime.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl border-2 bg-white p-8 shadow-lg transition-all duration-300 ${
                  plan.id === selectedPlan ? 'border-cyan-500 shadow-xl' : 'border-gray-100'
                } ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {plan.popular ? (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex rounded-full bg-cyan-600 px-5 py-1 text-sm font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                ) : null}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                  </div>
                  {plan.id === selectedPlan ? (
                    <BadgeCheck className="h-6 w-6 text-cyan-600" aria-label="Selected plan" />
                  ) : null}
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-sm text-gray-500">/ {plan.period}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`mt-6 w-full rounded-lg px-6 py-3 text-sm font-semibold transition ${
                    plan.id === selectedPlan
                      ? 'bg-cyan-600 text-white shadow-lg hover:bg-cyan-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.id === selectedPlan ? 'Selected' : 'Choose plan'}
                </button>
                <ul className="mt-8 space-y-4 text-sm text-gray-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <section className="bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to know before getting started
            </p>
          </div>
          <div className="mt-12 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-cyan-600 to-blue-700 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to Transform Your Career?</h2>
          <p className="mt-4 text-lg text-cyan-100">
            Take the first step toward your dream role. Start your free trial or dive into the course catalog.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 text-base font-semibold text-cyan-600 shadow-lg shadow-cyan-900/30 transition hover:-translate-y-0.5 hover:bg-cyan-50"
            >
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/70 px-8 py-3 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Browse courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

