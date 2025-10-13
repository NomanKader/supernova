import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/components/marketing/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const schema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
    agree: z.literal(true, {
      errorMap: () => ({ message: "You must agree before continuing" }),
    }),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );

const defaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  agree: false,
};

function AuthButton({ icon, children }) {
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
          <h1 className="text-3xl font-semibold text-slate-900">Create Your Account</h1>
          <p className="text-sm text-slate-500">
            Start your learning journey with Supernova
          </p>
        </div>
      </div>

      <Card className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-blue-100/40">
        <CardContent className="space-y-6 p-8">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="firstName">
                  First Name
                </label>
                <Input
                  id="firstName"
                  placeholder="First name"
                  className="h-11 rounded-xl border-transparent bg-[#edf3ff] text-sm focus:border-blue-500 focus:ring-blue-500"
                  {...register("firstName")}
                />
                {errors.firstName ? (
                  <p className="text-xs text-red-500">{errors.firstName.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="lastName">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  placeholder="Last name"
                  className="h-11 rounded-xl border-transparent bg-[#edf3ff] text-sm focus:border-blue-500 focus:ring-blue-500"
                  {...register("lastName")}
                />
                {errors.lastName ? (
                  <p className="text-xs text-red-500">{errors.lastName.message}</p>
                ) : null}
              </div>
            </div>

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
              <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                className="h-11 rounded-xl border-transparent bg-[#edf3ff] text-sm focus:border-blue-500 focus:ring-blue-500"
                autoComplete="new-password"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="h-11 rounded-xl border-transparent bg-[#edf3ff] text-sm focus:border-blue-500 focus:ring-blue-500"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? (
                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
              ) : null}
            </div>

            <div className="flex items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                {...register("agree")}
              />
              <p>
                I agree to the{" "}
                <Link to="/terms" className="font-medium text-blue-600 hover:text-blue-500">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </Link>
              </p>
            </div>
            {errors.agree ? (
              <p className="text-xs text-red-500">{errors.agree.message}</p>
            ) : null}

            <Button
              type="submit"
              className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-700"
            >
              Create Account
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
            </div>
          </div>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
