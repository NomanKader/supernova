import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-16">
      <header className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">Terms & Conditions</p>
        <h1 className="text-4xl font-bold text-slate-900">The Supernova LMS learner agreement.</h1>
        <p className="text-base text-slate-600">
          These Terms govern your use of the Supernova LMS platform, cohort experiences, mentorship sessions, and related services. By enrolling in a program or accessing the platform, you agree to the commitments outlined below.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">1. Account & eligibility</h2>
        <ul className="list-disc space-y-3 pl-6 text-sm text-slate-600">
          <li>You must be at least 18 years old (or the age of majority in your jurisdiction) to register and participate, unless your cohort is explicitly designed for minors with guardian consent.</li>
          <li>Account credentials are personal and cannot be shared. You are responsible for all activity conducted under your login.</li>
          <li>Keep your contact information accurate so we can deliver critical onboarding, scheduling, and certificate updates.</li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">2. Program access & conduct</h2>
        <ul className="list-disc space-y-3 pl-6 text-sm text-slate-600">
          <li>Enrollment grants a limited, non-transferable license to access course materials, mentor sessions, and community spaces for the duration specified at purchase.</li>
          <li>Respect community guidelines: maintain professional conduct, protect peer confidentiality, and refrain from harassment, discrimination, or plagiarism.</li>
          <li>Mentorship sessions (live or recorded) are for enrolled participants only. Sharing content publicly is prohibited without written consent.</li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">3. Payments, refunds, and cancellations</h2>
        <ul className="list-disc space-y-3 pl-6 text-sm text-slate-600">
          <li>Program fees are due at enrollment unless your plan offers installment or employer billing.</li>
          <li>Refunds follow the onboarding policy disclosed at checkout (e.g., full refund within 7 days of cohort start if less than 10% of content is consumed).</li>
          <li>Failure to complete payments may result in suspension of platform access and certificate issuance.</li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">4. Intellectual property</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Supernova LMS and its mentors retain ownership of all platform content, curriculum, branding, and technology. You may download cohort materials for personal learning but cannot reproduce, sell, or distribute them without written permission. Learner-generated projects remain yours; however, you grant Supernova LMS permission to showcase anonymized projects for promotional or educational purposes.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">5. Disclaimers & limitation of liability</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Supernova LMS provides career-development guidance, not guaranteed employment. We deliver mentorship and resources to accelerate learning; ultimate outcomes depend on your participation. To the maximum extent permitted by law, the platform is provided “as-is” and Supernova LMS is not liable for indirect or consequential damages arising from your use of the services.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">6. Suspension or termination</h2>
        <ul className="list-disc space-y-3 pl-6 text-sm text-slate-600">
          <li>We may suspend or terminate accounts that violate these Terms, community guidelines, or applicable laws.</li>
          <li>No refunds are provided for suspensions due to policy violations.</li>
          <li>You may close your account at any time by contacting <Link to="mailto:support@supernova.academy" className="font-semibold text-cyan-100 underline">support@supernova.academy</Link>.</li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">7. Changes to services & terms</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          We continuously evolve our programs based on learner feedback. Supernova LMS may modify course content, mentor assignments, or platform features. If we make material changes to these Terms, we will notify you via email and our in-product announcements. Continued use following changes constitutes acceptance of the updated Terms.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">8. Governing law</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          These Terms are governed by the laws of the State of California, USA, without regard to conflicts of law principles. Any disputes will be resolved through binding arbitration in San Francisco, California, unless prohibited by local law.
        </p>
      </section>

      <footer className="space-y-4 text-sm text-slate-600">
        <p>
          Questions about these Terms? Contact us at{' '}
          <Link to="mailto:legal@supernova.academy" className="font-semibold text-cyan-100 underline">
            legal@supernova.academy
          </Link>{' '}
          or by mail at Supernova LMS, 2450 Learning Lane, Suite 300, San Francisco, CA 94107.
        </p>
        <p className="text-xs text-slate-500">
          Effective date: January 15, 2026.
        </p>
      </footer>
    </div>
  );
}