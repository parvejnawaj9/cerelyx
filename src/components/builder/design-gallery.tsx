"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { categoryLabel } from "@/lib/categories";
import { cn } from "@/lib/cn";
import type { ThemePalette } from "@/lib/types";

export interface GalleryTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  palette: ThemePalette;
}

export function DesignGallery({ templates }: { templates: GalleryTemplate[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");

  const categories = useMemo(
    () => Array.from(new Set(templates.map((t) => t.category))),
    [templates]
  );
  const shown =
    filter === "all" ? templates : templates.filter((t) => t.category === filter);

  return (
    <div className="flex flex-col gap-8">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>
          All designs
        </Chip>
        {categories.map((c) => (
          <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>
            {categoryLabel(c)}
          </Chip>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((t) => (
          <article
            key={t.id}
            className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
          >
            <ThumbPreview palette={t.palette} name={t.name} />
            <div className="flex flex-1 flex-col gap-2 p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-medium text-ink">{t.name}</h3>
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs text-brand">
                  {categoryLabel(t.category)}
                </span>
              </div>
              <p className="flex-1 text-sm leading-relaxed text-muted">
                {t.description}
              </p>
              <button
                onClick={() => router.push(`/new?template=${t.id}`)}
                className={buttonClasses("primary", "sm", "mt-2 w-full")}
              >
                Use this design
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand bg-brand text-white"
          : "border-line-strong bg-surface text-muted hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

/** A palette-driven mini invitation, so each design reads as distinct. */
function ThumbPreview({ palette, name }: { palette: ThemePalette; name: string }) {
  return (
    <div
      className="relative flex h-40 flex-col items-center justify-center gap-2 px-6"
      style={{ backgroundColor: palette.canvas }}
    >
      <span
        className="text-[0.6rem] uppercase tracking-[0.3em]"
        style={{ color: palette.secondary }}
      >
        You&apos;re invited
      </span>
      <span
        className="text-2xl"
        style={{ fontFamily: "var(--font-display)", color: palette.primary }}
      >
        {name}
      </span>
      <span className="h-px w-12" style={{ backgroundColor: palette.gold }} />
      <div className="mt-1 flex gap-1.5">
        {[palette.primary, palette.secondary, palette.accent, palette.gold].map(
          (c, i) => (
            <span key={i} className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />
          )
        )}
      </div>
    </div>
  );
}
