"use client";

import { useEffect, useRef, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type AuthError,
  type User,
} from "firebase/auth";
import { Mail, Smartphone, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { auth, googleProvider } from "@/lib/firebase/client";
import { builderUrl } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/cn";

type Mode = "signin" | "signup";
type Method = "email" | "phone";
type Loading = "email" | "google" | "phone-send" | "phone-verify" | "reset" | "redirect" | null;

function friendlyError(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That email and password don't match. Try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in.";
    case "auth/weak-password":
      return "Use a password with at least 6 characters.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Your browser blocked the popup — redirecting you instead…";
    case "auth/account-exists-with-different-credential":
      return "You already have an account with a different sign-in method.";
    case "auth/invalid-phone-number":
    case "auth/missing-phone-number":
      return "Enter a valid mobile number, including the country code.";
    case "auth/invalid-verification-code":
      return "That code isn't right. Check it and try again.";
    case "auth/code-expired":
      return "That code expired. Please request a new one.";
    case "auth/quota-exceeded":
      return "We're sending too many codes right now. Please try again later.";
    case "auth/captcha-check-failed":
      return "Verification failed. Please try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/** Normalize a typed number to E.164 (defaults to +91 India when no country code). */
function toE164(raw: string): string {
  const trimmed = raw.replace(/[\s()-]/g, "");
  if (trimmed.startsWith("+")) return trimmed;
  if (/^\d{10}$/.test(trimmed)) return `+91${trimmed}`;
  return `+${trimmed}`;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const [method, setMethod] = useState<Method>("email");
  const [loading, setLoading] = useState<Loading>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [forgot, setForgot] = useState(false);

  // phone
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  async function establishSession(user: User) {
    const idToken = await user.getIdToken();
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Could not complete sign-in. Please try again.");
    }
    window.location.assign(builderUrl("/dashboard"));
  }

  // Complete any Google sign-in that fell back to a full-page redirect. Stays
  // silent (no loading flash) unless a redirect actually returned a user; on
  // failure it recovers to the form with an error rather than hanging.
  useEffect(() => {
    let active = true;
    getRedirectResult(auth)
      .then((result) => {
        if (active && result?.user) {
          setLoading("redirect");
          return establishSession(result.user);
        }
      })
      .catch(() => {
        if (active) {
          setLoading(null);
          setError("We couldn't finish signing you in. Please try again.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  function handleAuthError(err: unknown) {
    const code = (err as AuthError)?.code ?? "";
    if (code) setError(friendlyError(code));
    else if (err instanceof Error && err.message) setError(err.message);
    else setError("Something went wrong. Please try again.");
    setLoading(null);
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading("email");
    try {
      const cred =
        mode === "signup"
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password);
      await establishSession(cred.user);
    } catch (err) {
      handleAuthError(err);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading("google");
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await establishSession(cred.user);
    } catch (err) {
      const code = (err as AuthError)?.code ?? "";
      // Popups are unreliable on mobile / when blocked — fall back to redirect.
      if (
        code === "auth/popup-blocked" ||
        code === "auth/cancelled-popup-request" ||
        code === "auth/operation-not-supported-in-this-environment"
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (e2) {
          handleAuthError(e2);
          return;
        }
      }
      handleAuthError(err);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading("reset");
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const code = (err as AuthError)?.code ?? "";
      // Don't reveal whether the email exists — only surface input/rate errors.
      if (code === "auth/invalid-email" || code === "auth/too-many-requests") {
        setError(friendlyError(code));
        setLoading(null);
        return;
      }
    }
    setError(null);
    setNotice(
      "If an account exists for that email, we've sent a link to reset your password."
    );
    setForgot(false);
    setLoading(null);
  }

  function getRecaptcha(): RecaptchaVerifier {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
    return recaptchaRef.current;
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading("phone-send");
    try {
      const result = await signInWithPhoneNumber(auth, toE164(phone), getRecaptcha());
      setConfirmation(result);
      setNotice("We've sent a 6-digit code to your phone.");
      // The invisible reCAPTCHA token is single-use; drop the verifier so a
      // later resend mints a fresh one.
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
      setLoading(null);
    } catch (err) {
      // Reset the verifier so the next attempt starts clean.
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
      handleAuthError(err);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmation) return;
    setError(null);
    setLoading("phone-verify");
    try {
      const cred = await confirmation.confirm(code.trim());
      await establishSession(cred.user);
    } catch (err) {
      handleAuthError(err);
    }
  }

  function resetPhone() {
    setConfirmation(null);
    setCode("");
    setNotice(null);
    setError(null);
    recaptchaRef.current?.clear();
    recaptchaRef.current = null;
  }

  const busy = loading !== null;

  if (loading === "redirect") {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-muted" role="status">
        <Loader2 className="h-4 w-4 animate-spin" />
        Finishing sign-in…
      </div>
    );
  }

  // ---- Forgot password ----
  if (forgot) {
    return (
      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => {
            setForgot(false);
            setError(null);
          }}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </button>
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl text-ink">Reset your password</h2>
          <p className="text-sm text-muted">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>
        <form onSubmit={handleReset} className="flex flex-col gap-4" noValidate>
          <Field label="Email" htmlFor="reset-email">
            <Input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          {error && <ErrorNote>{error}</ErrorNote>}
          <Button type="submit" size="lg" disabled={busy} className="w-full">
            {loading === "reset" ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Button
        variant="secondary"
        size="lg"
        onClick={handleGoogle}
        disabled={busy}
        className="w-full"
      >
        <GoogleGlyph />
        {loading === "google" ? "Connecting…" : "Continue with Google"}
      </Button>

      <div className="flex items-center gap-3 text-xs text-faint">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      {/* Method toggle */}
      <div
        role="group"
        aria-label="Sign-in method"
        className="flex rounded-full border border-line bg-surface p-0.5"
      >
        {(
          [
            ["email", "Email", Mail],
            ["phone", "Phone", Smartphone],
          ] as const
        ).map(([m, label, Icon]) => (
          <button
            key={m}
            type="button"
            aria-pressed={method === m}
            onClick={() => {
              setMethod(m);
              resetPhone();
            }}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
              method === m ? "bg-brand text-white" : "text-muted hover:text-ink"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {notice && (
        <p
          className="rounded-[var(--radius-sm)] bg-brand/10 px-3 py-2 text-sm text-brand"
          role="status"
        >
          {notice}
        </p>
      )}

      {method === "email" && (
        <form onSubmit={handleEmail} className="flex flex-col gap-4" noValidate>
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          <Field
            label="Password"
            htmlFor="password"
            hint={mode === "signup" ? "At least 6 characters." : undefined}
          >
            <div className="relative">
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                aria-pressed={showPw}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted transition-colors hover:text-ink"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          {mode === "signin" && (
            <button
              type="button"
              onClick={() => {
                setForgot(true);
                setError(null);
                setNotice(null);
              }}
              className="-mt-1 w-fit text-sm text-brand underline-offset-4 hover:underline"
            >
              Forgot password?
            </button>
          )}

          {error && <ErrorNote>{error}</ErrorNote>}

          <Button type="submit" size="lg" disabled={busy} className="w-full">
            {loading === "email"
              ? "Just a moment…"
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </Button>
        </form>
      )}

      {method === "phone" && !confirmation && (
        <form onSubmit={handleSendCode} className="flex flex-col gap-4" noValidate>
          <Field
            label="Mobile number"
            htmlFor="phone"
            hint="Include your country code, e.g. +91 98765 43210."
          >
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </Field>
          {error && <ErrorNote>{error}</ErrorNote>}
          <Button type="submit" size="lg" disabled={busy} className="w-full">
            {loading === "phone-send" ? "Sending code…" : "Send code"}
          </Button>
        </form>
      )}

      {method === "phone" && confirmation && (
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-4" noValidate>
          <Field label="Enter the 6-digit code" htmlFor="code">
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
            />
          </Field>
          {error && <ErrorNote>{error}</ErrorNote>}
          <Button type="submit" size="lg" disabled={busy} className="w-full">
            {loading === "phone-verify" ? "Verifying…" : "Verify & continue"}
          </Button>
          <button
            type="button"
            onClick={resetPhone}
            className="w-fit text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Use a different number
          </button>
        </form>
      )}

      {/* Invisible reCAPTCHA mount point for phone sign-in. */}
      <div id="recaptcha-container" />
    </div>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="rounded-[var(--radius-sm)] bg-rose/10 px-3 py-2 text-sm text-rose"
      role="alert"
    >
      {children}
    </p>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
