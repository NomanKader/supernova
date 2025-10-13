import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-16">
      <header className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">Privacy Policy</p>
        <h1 className="text-4xl font-bold text-slate-900">Protecting your learning journey.</h1>
        <p className="text-base text-slate-600">
          Supernova LMS empowers ambitious learners with expert-led cohorts. This Privacy Policy explains how we collect, use, and safeguard your personal data when you participate in our programs, use our website, and engage with mentors and peers.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">1. Information we collect</h2>
        <div className="space-y-4 text-sm text-slate-600">
          <p className="leading-relaxed">
            <span className="font-semibold text-slate-900">Account details:</span> Your name, email address, password, role, and profile photo help us create and secure your Supernova LMS account.
          </p>
          <p className="leading-relaxed">
            <span className="font-semibold text-slate-900">Learning activity:</span> We track cohort enrollments, course progress, completion status, assessments, and feedback to deliver personalized content and mentor support.
          </p>
          <p className="leading-relaxed">
            <span className="font-semibold text-slate-900">Payment data:</span> Enrollment transactions are processed through trusted payment processors. We store only transaction identifiers, payment amounts, and status; card details never touch our servers.
          </p>
          <p className="leading-relaxed">
            <span className="font-semibold text-slate-900">Support interactions:</span> Messages, call recordings, and support tickets help our team and mentors respond effectively to your requests.
          </p>
          <p className="leading-relaxed">
            <span className="font-semibold text-slate-900">Device & usage data:</span> We use cookies and analytics to understand how the platform is used, improve usability, and maintain security.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">2. How we use your information</h2>
        <ul className="list-disc space-y-3 pl-6 text-sm text-slate-600">
          <li>Provide and personalize learning experiences, including adaptive recommendations and mentor matching.</li>
          <li>Manage enrollments, billing, cohort logistics, mentor assignments, and certification tracking.</li>
          <li>Monitor academic integrity, uphold community guidelines, and protect the safety of all learners.</li>
          <li>Deliver service announcements, reminders, mentorship updates, and relevant learning opportunities.</li>
          <li>Analyze performance, gather feedback, and develop new features to enhance outcomes.</li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">3. How we share your data</h2>
        <div className="space-y-4 text-sm text-slate-600">
          <p>We share information only when necessary:</p>
          <ul className="list-disc space-y-3 pl-6">
            <li><span className="font-semibold text-slate-900">Mentors & coaches:</span> Cohort facilitators receive relevant learning activity to tailor guidance.</li>
            <li><span className="font-semibold text-slate-900">Service providers:</span> Payment gateways, analytics services, and communication tools process data under contract and cannot use it independently.</li>
            <li><span className="font-semibold text-slate-900">Corporate partners:</span> If you enroll through an employer-sponsored plan, limited progress reports may be shared according to program agreements.</li>
            <li><span className="font-semibold text-slate-900">Legal or safety needs:</span> We may disclose data if required by law, to prevent fraud, or to protect learners and staff.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">4. Your rights & choices</h2>
        <div className="space-y-4 text-sm text-slate-600">
          <p>You can access, update, or delete your profile information at any time from your learner dashboard.</p>
          <p>Adjust email or messaging preferences through notification settings or the unsubscribe link in emails.</p>
          <p>Request a copy of your data or submit deletion requests by contacting <Link to="mailto:privacy@supernova.academy" className="font-semibold text-cyan-100 underline">privacy@supernova.academy</Link>.</p>
          <p>Disable non-essential cookies via your browser or in-product controls. Essential cookies are required for authentication and session management.</p>
          <p>If you reside in jurisdictions with additional privacy protections (e.g., GDPR, CCPA), you have the right to know how data is processed and can exercise applicable rights by contacting us.</p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">5. Data retention & security</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          We retain learner information for as long as your account remains active or as needed to provide cohort services. When data is no longer required, we anonymize or securely delete it. Supernova LMS uses industry-standard encryption, secure development practices, and regular audits to protect your information.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">6. International data transfers</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Supernova LMS is operated in the United States with global mentors and learners. By using the platform, you consent to the transfer of your data to the United States and other countries where our service providers operate, subject to appropriate safeguards.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">7. Updates to this policy</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          We may revise this Privacy Policy to reflect new features, legal requirements, or industry best practices. When changes are significant, we will notify learners by email and post an in-product banner. Continued use of the platform means you accept the updated policy.
        </p>
      </section>

      <footer className="space-y-4 text-sm text-slate-600">
        <p>
          Have questions about privacy at Supernova LMS? Contact our Data Protection Officer at{' '}
          <Link to="mailto:privacy@supernova.academy" className="font-semibold text-cyan-100 underline">
            privacy@supernova.academy
          </Link>{' '}
          or by mail at Supernova LMS, 2450 Learning Lane, Suite 300, San Francisco, CA 94107.
        </p>
        <p className="text-xs text-slate-500">
          This policy is effective as of January 15, 2026 and supersedes all previous versions.
        </p>
      </footer>
    </div>
  );
}