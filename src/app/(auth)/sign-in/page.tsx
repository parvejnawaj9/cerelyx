import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="flex flex-col gap-8">
      <Link href="/" className="lg:hidden">
        <Logo />
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl text-ink">Welcome back</h1>
        <p className="text-sm text-muted">
          Sign in to keep building your celebration.
        </p>
      </header>

      <AuthForm mode="signin" />

      <p className="text-sm text-muted">
        New here?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
