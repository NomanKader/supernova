import { useEffect } from "react";

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-4 py-16">
      <header className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">Terms & Conditions</p>
        <h1 className="text-4xl font-bold text-slate-900">Simple usage terms for this preview.</h1>
        <p className="text-base text-slate-600">
          This website is a static preview of Supernova’s course catalog. Interactive features such as registration, payment, and enrollments are disabled. By browsing the site you agree to these basic terms.
        </p>
      </header>

      <section className="space-y-4 text-sm leading-relaxed text-slate-600">
        <h2 className="text-2xl font-semibold text-slate-900">1. Informational purpose only</h2>
        <p>
          The pages you see are for demonstration and review. They display course descriptions, media assets, and other content owned by Supernova. Nothing on the site constitutes a commercial offer, contract, or guarantee of availability.
        </p>
      </section>

      <section className="space-y-4 text-sm leading-relaxed text-slate-600">
        <h2 className="text-2xl font-semibold text-slate-900">2. No accounts, submissions, or payments</h2>
        <p>
          Sign-in, registration, purchase, and enrollment flows are intentionally disabled. We do not request or collect personal details, payment information, or user-generated content. Please do not attempt to submit confidential information through any placeholder forms.
        </p>
      </section>

      <section className="space-y-4 text-sm leading-relaxed text-slate-600">
        <h2 className="text-2xl font-semibold text-slate-900">3. Intellectual property</h2>
        <p>
          All text, images, trademarks, and other materials on this site remain the property of Supernova. You may review the content for evaluation purposes only and may not copy, redistribute, or use it commercially without written permission.
        </p>
      </section>

      <section className="space-y-4 text-sm leading-relaxed text-slate-600">
        <h2 className="text-2xl font-semibold text-slate-900">4. External services</h2>
        <p>
          Certain sections link to third-party services such as Google Maps. Visiting those services is optional and subject to their respective terms and privacy policies.
        </p>
      </section>

      <section className="space-y-4 text-sm leading-relaxed text-slate-600">
        <h2 className="text-2xl font-semibold text-slate-900">5. Disclaimer</h2>
        <p>
          The preview is provided “as is” without warranties of any kind. Supernova is not responsible for damages or losses arising from your use of, or inability to use, this static site.
        </p>
      </section>

      <section className="space-y-4 text-sm leading-relaxed text-slate-600">
        <h2 className="text-2xl font-semibold text-slate-900">6. Contact & future updates</h2>
        <p>
          For questions, email nksoftwarehouse@gmail.com. These terms will be replaced with a comprehensive agreement if and when interactive functionality is launched.
        </p>
      </section>

      <footer className="space-y-2 text-xs text-slate-500">
        <p>Effective as of January 2026.</p>
      </footer>
    </div>
  );
}
