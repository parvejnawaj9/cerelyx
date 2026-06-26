import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listTemplates } from "@/templates/catalog";
import {
  DesignGallery,
  type GalleryTemplate,
} from "@/components/builder/design-gallery";

export const metadata: Metadata = { title: "Designs" };

export default function TemplatesPage() {
  const templates: GalleryTemplate[] = listTemplates().map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    palette: t.defaultTheme.palette,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">
        Choose a design
      </h1>
      <p className="mt-2 max-w-xl text-muted">
        Every theme is hand-crafted with its own character — pick one, then make
        it yours in the editor.
      </p>
      <div className="mt-10">
        <DesignGallery templates={templates} />
      </div>
    </div>
  );
}
