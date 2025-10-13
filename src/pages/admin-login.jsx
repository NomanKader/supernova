import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email || !password) {
      setError("Enter your work email and password to continue.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      sessionStorage.setItem("adminToken", "demo-admin-token");
      navigate("/admin", { replace: true });
    }, 600);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#f3f6ff] px-4 pb-24 pt-16">
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-b from-blue-500 to-indigo-500 shadow-lg shadow-blue-100">
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Supernova Admin</h1>
          <p className="text-sm text-slate-500">
            Sign in to manage courses, instructors, onboarding, and promotions.
          </p>
        </div>
      </div>

      <Card className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-blue-100/60">
        <CardContent className="space-y-6 p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="admin-email">
                Work Email
              </label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@supernova.dev"
                className="h-11 rounded-xl border-transparent bg-[#edf3ff] text-sm focus:border-blue-500 focus:ring-blue-500"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700" htmlFor="admin-password">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter your password"
                className="h-11 rounded-xl border-transparent bg-[#edf3ff] text-sm focus:border-blue-500 focus:ring-blue-500"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error ? <p className="text-xs text-red-500">{error}</p> : null}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-700"
            >
              {isLoading ? "Signing in..." : "Continue"}
            </Button>
          </form>

          <div className="space-y-3 text-xs text-slate-500">
            <p className="font-semibold text-slate-700">Admin tips</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Use your Supernova admin email credentials.</li>
              <li>2FA is required for publishing changes.</li>
              <li>Need help? Reach out to ops@supernova.dev.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
