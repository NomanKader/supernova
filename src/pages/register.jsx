import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Loader2, Apple as AppleIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/components/marketing/auth-context";
import { apiFetch, BUSINESS_NAME } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  agree: z.literal(true, {
    errorMap: () => ({ message: "You must agree before continuing" }),
  }),
});

const defaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  agree: false,
};

export default function RegisterPage() {
  const navigate = useNavigate();
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
      return `${window.location.origin}/register`;
    }
    return "";
  }, []);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [googleReady, setGoogleReady] = React.useState(false);
  const [googleError, setGoogleError] = React.useState("");
  const [isAppleLoading, setIsAppleLoading] = React.useState(false);
  const [appleReady, setAppleReady] = React.useState(false);
  const [appleError, setAppleError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

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
      // Ignore duplicates; log other errors for visibility
      if (error?.status && (error.status === 409 || error.status === 400)) {
        return;
      }
      console.warn("Failed to sync user directory", error);
    }
  }, [BUSINESS_NAME]);

  const sendRegistrationInvite = React.useCallback(async ({ firstName, lastName, email }) => {
    if (!BUSINESS_NAME || !email) {
      throw new Error("Registration is unavailable right now.");
    }

    const composedName =
      [firstName, lastName].filter(Boolean).join(" ").trim() ||
      email;

    try {
      await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({
          name: composedName,
          email,
          role: "student",
          businessName: BUSINESS_NAME,
          sendInvite: true,
        }),
      });
    } catch (error) {
      if (error?.status && (error.status === 409 || error.status === 400)) {
        throw new Error("This email is already registered. Please check your inbox for the verification email.");
      }
      if (typeof error?.message === "string" && error.message.toLowerCase().includes("duplicate")) {
        throw new Error("Looks like this email already has an account. Try signing in or use the verification email that was sent earlier.");
      }
      throw error;
    }
  }, [BUSINESS_NAME]);

  const handleAppleSignIn = React.useCallback(async () => {
    if (typeof window === "undefined" || !window.AppleID?.auth) {
      setAppleError("Apple Sign-In is unavailable.");
      return;
    }
    if (!appleReady) {
      setAppleError("Apple Sign-In is still initializing.");
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
        email: profile.email,
        name: profile.name || profile.email,
        avatarUrl: null,
        provider: "apple",
        subscribe: false,
      });
      navigate("/courses");
    } catch (error) {
      console.error("Apple sign-up failed", error);
      if (error?.error === "popup_closed_by_user") {
        setAppleError("Apple sign-in was cancelled.");
      } else {
        setAppleError(error.message || "Unable to sign up with Apple right now.");
      }
    } finally {
      setIsAppleLoading(false);
    }
  }, [appleReady, login, navigate, syncUserDirectory]);

  const onSubmit = async (values) => {
    setFormError("");
    setSuccessMessage("");
    setIsSubmitting(true);
    try {
      await sendRegistrationInvite({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
      });
      reset(defaultValues);
      setSuccessMessage("Thanks! Please check your email to verify your account and set your password.");
    } catch (error) {
      console.error("Registration failed", error);
      setFormError(error.message || "Unable to start registration right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!googleClientId) {
      setGoogleError("Set VITE_GOOGLE_CLIENT_ID to enable Google sign-up.");
      return undefined;
    }

    const handleLoaded = () => {
      setGoogleError("");
      setGoogleReady(true);
    };

    const handleError = () => {
      setGoogleError("Unable to load Google Sign-In at the moment.");
    };

    if (typeof window !== "undefined" && window.google && window.google.accounts?.id) {
      handleLoaded();
      return undefined;
    }

    let script = document.querySelector('script[data-google-identity]');
    if (script) {
      script.addEventListener("load", handleLoaded);
      script.addEventListener("error", handleError);
      return () => {
        script.removeEventListener("load", handleLoaded);
        script.removeEventListener("error", handleError);
      };
    }

    script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.onload = handleLoaded;
    script.onerror = handleError;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [googleClientId]);

  const handleGoogleCredential = React.useCallback(
    async (response) => {
      if (!response?.credential) {
        setGoogleError("Google did not return a credential. Please try again.");
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
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.picture,
          provider: "google",
          subscribe: false,
        });
        navigate("/courses");
      } catch (error) {
        console.error("Google sign-up failed", error);
        setGoogleError(error.message || "Unable to sign up with Google right now.");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [login, navigate, syncUserDirectory],
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
      text: "signup_with",
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
          <h1 className="text-3xl font-semibold text-slate-900">Create Your Account</h1>
          <p className="text-sm text-slate-500">
            Start your learning journey with Supernova
          </p>
          <p className="text-xs text-slate-500">
            After signing up, you&apos;ll get an email with a verification link to set your password.
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
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Sending verification email..." : "Create Account"}
            </Button>
            {formError ? (
              <p className="text-sm text-center text-red-500">{formError}</p>
            ) : null}
            {successMessage ? (
              <p className="text-sm text-center text-green-600">{successMessage}</p>
            ) : null}
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
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    Connecting to Google...
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
                      Sign up with Apple
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
