import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create your account" };

export default function SignUpPage() {
  return (
    <div className="flex flex-col gap-8">
      <Link href="/" className="lg:hidden">
        <Logo />
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl text-ink">Create your account</h1>
        <p className="text-sm text-muted">
          Start your event website — it takes a minute.
        </p>
      </header>

      <AuthForm mode="signup" />

      <p className="text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
