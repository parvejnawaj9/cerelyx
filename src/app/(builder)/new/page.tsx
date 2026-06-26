import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listTemplates } from "@/templates/catalog";
import {
  NewSiteForm,
  type TemplateOption,
} from "@/components/builder/new-site-form";

export const metadata: Metadata = { title: "New event site" };

export default async function NewSitePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  const templates: TemplateOption[] = listTemplates().map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    palette: {
      primary: t.defaultTheme.palette.primary,
      secondary: t.defaultTheme.palette.secondary,
      accent: t.defaultTheme.palette.accent,
      gold: t.defaultTheme.palette.gold,
    },
  }));

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/templates"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to designs
      </Link>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">
        Create a new site
      </h1>
      <p className="mt-2 text-muted">
        Name your celebration and pick a design — you&apos;ll fill in the details
        next.
      </p>
      <div className="mt-10">
        <NewSiteForm templates={templates} initialTemplateId={template} />
      </div>
    </div>
  );
}
