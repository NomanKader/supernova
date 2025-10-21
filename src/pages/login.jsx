import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { useAuth } from "@/components/marketing/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

const defaultValues = {
  email: "",
  password: "",
  remember: false,
};

function AuthButton({
  icon,
  children,
}) {
  return (
    <Button
      variant="outline"
      className="flex w-full items-center justify-center gap-2 rounded-xl border-slate-200 bg-white text-slate-600 transition hover:border-blue-400 hover:text-blue-600"
      type="button"
    >
      {icon}
      {children}
    </Button>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = (values) => {
    login({ email: values.email, subscribe: false });
    reset(defaultValues);
    navigate("/courses");
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#f3f6ff] px-4 pb-24 pt-16">
      <div className="mb-12 flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-b from-blue-500 to-indigo-500 shadow-lg shadow-blue-100">
          <GraduationCap className="h-7 w-7 text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Welcome Back</h1>
          <p className="text-sm text-slate-500">
            Sign in to continue your learning journey
          </p>
        </div>
      </div>

      <Card className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-blue-100/40">
        <CardContent className="space-y-6 p-8">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="email">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="h-11 rounded-xl border-transparent bg-[#edf3ff] text-sm focus:border-blue-500 focus:ring-blue-500"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                  Password
                </label>
                <Link
                  to="#"
                  className="text-xs font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="h-11 rounded-xl border-transparent bg-[#edf3ff] text-sm focus:border-blue-500 focus:ring-blue-500"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              ) : null}
            </div>

            <div className="flex items-center justify-between text-sm text-slate-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  {...register("remember")}
                />
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-700"
            >
              Sign In
            </Button>
          </form>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Separator className="flex-1 bg-slate-200" />
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Or continue with
              </span>
              <Separator className="flex-1 bg-slate-200" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <AuthButton icon={<span className="text-lg text-red-500">G</span>}>
                Google
              </AuthButton>
              {/* <AuthButton icon={<span className="text-lg text-blue-600">f</span>}>
                Facebook
              </AuthButton> */}
            </div>
          </div>

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
              Sign up for free
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


