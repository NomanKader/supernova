export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="text-muted-foreground">
        These sample terms outline how Supernova LMS delivers learning programs, collects feedback, and maintains a safe community. Replace this placeholder with your legal copy before going live.
      </p>
      <ol className="space-y-4 text-sm text-muted-foreground">
        <li>1. Cohort access is granted to individual learners and cannot be shared.</li>
        <li>2. Mentorship sessions and recordings remain confidential to the cohort.</li>
        <li>3. Refunds follow the onboarding policy agreed during enrollment.</li>
        <li>4. Misuse of the platform may result in suspension.</li>
      </ol>
    </div>
  );
}
