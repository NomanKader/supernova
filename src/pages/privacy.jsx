export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="text-muted-foreground">
        We value learner trust. This placeholder policy explains what data we collect, how we use it to improve programming, and the choices you have. Update it with your official policy before launch.
      </p>
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>• We collect profile information, progress metrics, and feedback to personalize your journey.</p>
        <p>• Communication preferences can be managed from your learner dashboard at any time.</p>
        <p>• We never sell learner data and only share with mentors supporting your cohort.</p>
        <p>• For data removal requests, contact privacy@supernova.dev.</p>
      </div>
    </div>
  );
}
