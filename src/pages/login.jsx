import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Loader2, Apple as AppleIcon } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";

import { useAuth } from "@/components/marketing/auth-context";
import { apiFetch, BUSINESS_NAME } from "@/config/api";
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

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTarget = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    const next = params.get("redirect");
    return next && next.startsWith("/") ? next : "/";
  }, [location.search]);
  const { login } = useAuth();
  const googleButtonRef = React.useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID;
  const appleScope = import.meta.env.VITE_APPLE_SCOPE || "name email";
  const appleRedirectUri = React.useMemo(() => {
    if (import.meta.env.VITE_APPLE_REDIRECT_URI) {
      return import.meta.env.VITE_APPLE_REDIRECT_URI;
    }
    if (typeof window !== "undefined" && window.location) {
      return `${window.location.origin}/login`;
    }
    return "";
  }, []);
  const [googleReady, setGoogleReady] = React.useState(false);
  const [googleError, setGoogleError] = React.useState("");
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [appleReady, setAppleReady] = React.useState(false);
  const [appleError, setAppleError] = React.useState("");
  const [isAppleLoading, setIsAppleLoading] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

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

  const onSubmit = async (values) => {
    setFormError("");
    setSubmitting(true);
    try {
      const payload = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          businessName: BUSINESS_NAME,
        }),
      });
      const authResult = payload?.data || payload;
      if (!authResult?.user) {
        throw new Error("Unexpected response from server.");
      }
      login({
        user: {
          email: authResult.user.email,
          name: authResult.user.name,
          avatarUrl: authResult.user.avatarUrl,
          provider: "password",
        },
        token: authResult.token,
      });
      reset(defaultValues);
      navigate(redirectTarget);
    } catch (error) {
      setFormError(error.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!googleClientId) {
      setGoogleError("Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in.");
      return undefined;
    }

    const markReady = () => {
      setGoogleError("");
      setGoogleReady(true);
    };

    const markError = () => {
      setGoogleError("Unable to load Google Sign-In.");
    };

    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      markReady();
      return undefined;
    }

    let script = document.querySelector('script[data-google-identity]');
    if (script) {
      script.addEventListener("load", markReady);
      script.addEventListener("error", markError);
      return () => {
        script.removeEventListener("load", markReady);
        script.removeEventListener("error", markError);
      };
    }

    script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.onload = markReady;
    script.onerror = markError;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [googleClientId]);

  const syncUserDirectory = React.useCallback(async (profile) => {
    if (!BUSINESS_NAME || !profile?.email) {
      return;
    }

    const composedName =
      profile.name?.trim() ||
      [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() ||
      profile.email;

    try {
      await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({
          name: composedName,
          email: profile.email,
          role: "student",
          businessName: BUSINESS_NAME,
          status: "active",
          sendInvite: false,
        }),
      });
    } catch (error) {
      if (error?.status && (error.status === 409 || error.status === 400)) {
        return;
      }
      console.warn("Failed to sync user directory", error);
    }
  }, [BUSINESS_NAME]);

  const handleAppleSignIn = React.useCallback(async () => {
    if (typeof window === "undefined" || !window.AppleID?.auth) {
      setAppleError("Apple Sign-In is unavailable.");
      return;
    }
    if (!appleReady) {
      setAppleError("Apple Sign-In is still initializing. Please try again.");
      return;
    }

    setIsAppleLoading(true);
    setAppleError("");
    try {
      const response = await window.AppleID.auth.signIn();
      const identityToken = response?.authorization?.id_token;
      if (!identityToken) {
        throw new Error("Apple did not return a valid identity token.");
      }
      const payload = await apiFetch("/api/auth/apple", {
        method: "POST",
        body: JSON.stringify({ identityToken }),
      });
      const profile = payload?.data || payload;
      await syncUserDirectory(profile);
      login({
        user: {
          email: profile.email,
          name: profile.name || profile.email,
          avatarUrl: null,
          provider: "apple",
        },
        subscribe: false,
      });
      navigate(redirectTarget);
    } catch (error) {
      console.error("Apple sign-in failed", error);
      if (error?.error === "popup_closed_by_user") {
        setAppleError("Apple sign-in was cancelled.");
      } else {
        setAppleError(error.message || "Unable to sign in with Apple.");
      }
    } finally {
      setIsAppleLoading(false);
    }
  }, [appleReady, login, navigate, redirectTarget, syncUserDirectory]);

  const handleGoogleCredential = React.useCallback(
    async (response) => {
      if (!response?.credential) {
        setGoogleError("Google did not return a credential.");
        return;
      }

      setIsGoogleLoading(true);
      setGoogleError("");
      try {
        const payload = await apiFetch("/api/auth/google", {
          method: "POST",
          body: JSON.stringify({ credential: response.credential }),
        });
        const profile = payload?.data || payload;
        await syncUserDirectory(profile);
        login({
          user: {
            email: profile.email,
            name: profile.name,
            avatarUrl: profile.picture,
            provider: "google",
          },
          subscribe: false,
        });
        navigate(redirectTarget);
      } catch (error) {
        console.error("Google sign-in failed", error);
        setGoogleError(error.message || "Unable to sign in with Google.");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [login, navigate, redirectTarget, syncUserDirectory],
  );

  React.useEffect(() => {
    if (!googleReady || !googleClientId) {
      return;
    }
    if (typeof window === "undefined" || !window.google?.accounts?.id || !googleButtonRef.current) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredential,
      ux_mode: "popup",
    });

    const target = googleButtonRef.current;
    target.innerHTML = "";
    window.google.accounts.id.renderButton(target, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "signin_with",
      width: target.offsetWidth || 320,
    });
  }, [googleReady, googleClientId, handleGoogleCredential]);

  React.useEffect(() => {
    setAppleReady(false);
    if (!appleClientId) {
      setAppleError("Set VITE_APPLE_CLIENT_ID to enable Sign in with Apple.");
      return undefined;
    }
    if (!appleRedirectUri) {
      setAppleError("Set VITE_APPLE_REDIRECT_URI to match your Apple configuration.");
      return undefined;
    }
    if (typeof window === "undefined") {
      return undefined;
    }

    const initializeApple = () => {
      try {
        if (!window.AppleID?.auth) {
          setAppleError("Apple Sign-In is unavailable.");
          return;
        }
        window.AppleID.auth.init({
          clientId: appleClientId,
          redirectURI: appleRedirectUri,
          scope: appleScope,
          usePopup: true,
        });
        setAppleReady(true);
        setAppleError("");
      } catch (error) {
        console.error("Failed to initialize Apple Sign-In", error);
        setAppleError("Unable to initialize Apple Sign-In.");
      }
    };

    const handleScriptError = () => {
      setAppleError("Unable to load Apple Sign-In.");
    };

    if (window.AppleID?.auth) {
      initializeApple();
      return undefined;
    }

    let script = document.querySelector('script[data-appleid-sdk]');
    if (script) {
      script.addEventListener("load", initializeApple);
      script.addEventListener("error", handleScriptError);
    } else {
      script = document.createElement("script");
      script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
      script.async = true;
      script.defer = true;
      script.dataset.appleidSdk = "true";
      script.addEventListener("load", initializeApple);
      script.addEventListener("error", handleScriptError);
      document.head.appendChild(script);
    }

    return () => {
      script?.removeEventListener("load", initializeApple);
      script?.removeEventListener("error", handleScriptError);
    };
  }, [appleClientId, appleRedirectUri, appleScope]);

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
              disabled={submitting}
            >
              {submitting ? "Signing In..." : "Sign In"}
            </Button>
            {formError ? <p className="text-sm text-red-500">{formError}</p> : null}
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
              <div className="w-full">
                <div ref={googleButtonRef} className="flex w-full justify-center" />
                {isGoogleLoading ? (
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
                    Signing in with Google.
                  </div>
                ) : null}
                {googleError ? (
                  <p className="mt-3 text-center text-xs text-red-500">{googleError}</p>
                ) : null}
              </div>
              <div className="w-full">
                <button
                  type="button"
                  onClick={handleAppleSignIn}
                  disabled={!appleReady || isAppleLoading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAppleLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                      Connecting to Apple...
                    </>
                  ) : (
                    <>
                      <AppleIcon className="h-4 w-4 text-slate-900" />
                      Sign in with Apple
                    </>
                  )}
                </button>
                {appleError ? (
                  <p className="mt-3 text-center text-xs text-red-500">{appleError}</p>
                ) : null}
              </div>
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

