import { Lightbulb, Workflow } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation"
        description="Workflow automations will orchestrate reminders, certificate issuance and payment follow-ups."
      >
        <Badge variant="secondary">Coming soon</Badge>
      </PageHeader>

      <Card className="border-dashed">
        <CardHeader className="flex items-center gap-3">
          <Workflow className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>Phase 4 roadmap</CardTitle>
            <CardDescription>Planned triggers spanning manual approvals and learner nudges.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" /> Automate reminder emails when manual payments stay pending &gt;48h.
          </p>
          <p className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" /> Issue certificates automatically when grading is complete and instructor approves.
          </p>
          <p className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" /> Send slack notifications for new referral sign-ups and high-performing promotions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}





