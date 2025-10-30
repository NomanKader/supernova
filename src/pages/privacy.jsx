import { useEffect } from "react";

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-4 py-16">
      <header className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">Privacy Policy</p>
        <h1 className="text-4xl font-bold text-slate-900">A simple statement about your privacy.</h1>
        <p className="text-base text-slate-600">
          Supernova currently operates this site as a static catalog experience. We do not collect, store, or process personal data from visitors. The information you see is limited to course descriptions, images, and marketing copy owned by Supernova.
        </p>
      </header>

      <section className="space-y-4 text-sm leading-relaxed text-slate-600">
        <h2 className="text-2xl font-semibold text-slate-900">1. No user accounts or tracking</h2>
        <p>
          Sign-in, registration, enrollments, and payment flows are disabled. Because there are no forms to complete, we do not ask for names, email addresses, payment details, or any other sensitive information.
        </p>
        <p>
          We do not run analytics, cookies, advertising pixels, or third-party scripts that profile visitors. Your IP address and browsing behaviour are not logged for marketing purposes.
        </p>
      </section>

      <section className="space-y-4 text-sm leading-relaxed text-slate-600">
        <h2 className="text-2xl font-semibold text-slate-900">2. Content ownership</h2>
        <p>
          All course descriptions, imagery, and promotional assets displayed on this website are the intellectual property of Supernova. They are shown for reference only and do not constitute a binding offer or contract.
        </p>
      </section>

      <section className="space-y-4 text-sm leading-relaxed text-slate-600">
        <h2 className="text-2xl font-semibold text-slate-900">3. External links</h2>
        <p>
          Some pages may point to third-party resources (for example, Google Maps). Visiting those services is optional and subject to their own privacy terms.
        </p>
      </section>

      <section className="space-y-4 text-sm leading-relaxed text-slate-600">
        <h2 className="text-2xl font-semibold text-slate-900">4. Contact</h2>
        <p>
          If you have questions about this static preview, email nksoftwarehouse@gmail.com. Because we do not store personal information, requests to access or delete data are not applicable at this time.
        </p>
      </section>

      <footer className="space-y-2 text-xs text-slate-500">
        <p>This simplified policy is effective as of January 2026 and will be updated before any interactive features are launched.</p>
      </footer>
    </div>
  );
}
