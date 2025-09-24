import * as React from "react";
import { Share2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { referralPrograms } from "@/data/mock-data";

const program = referralPrograms[0];

const schema = z.object({
  rewardDescription: z.string().min(5, "Please describe the reward."),
  targetReferrals: z.coerce.number().min(0, "Target must be zero or higher."),
  active: z.boolean(),
});

const defaultValues = {
  rewardDescription: program?.rewardDescription ?? "",
  targetReferrals: program?.targetReferrals ?? 0,
  active: program?.active ?? false,
};

export default function ReferralsPage() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = (values) => {
    console.log("Update referral program", values);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral program"
        description="Track community-driven growth and configure incentives."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Program status
            </CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <StatusBadge status={program?.active ? "active" : "paused"} />
            <CardDescription className="mt-2">
              Toggle activation below to pause rewards.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {program?.referredCount ?? 0}
            </div>
            <CardDescription>
              {program?.conversionRate ?? 0}% conversion to paid learners
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reward
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {program?.rewardDescription ?? ""}
            </div>
            <CardDescription className="mt-2">
              Editable reward copy below.
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Configure rewards</CardTitle>
          <CardDescription>
            Update benefits and thresholds for the referral initiative.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="rewardDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reward</FormLabel>
                    <FormControl>
                      <Input placeholder="Give 10%, get 10%" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetReferrals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quarter goal</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Program active</FormLabel>
                      <CardDescription>
                        Enable to show referral CTAs across the LMS.
                      </CardDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Save settings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
