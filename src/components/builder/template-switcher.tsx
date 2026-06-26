"use client";

import { listTemplates, getTemplateCatalog } from "@/templates/catalog";
import { cn } from "@/lib/cn";
import type { Theme, SectionBlock } from "@/lib/types";

export function TemplateSwitcher({
  current,
  onSwitch,
}: {
  current: string;
  onSwitch: (p: {
    templateId: string;
    theme: Theme;
    sections: SectionBlock[];
  }) => void;
}) {
  const templates = listTemplates();
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
        Design
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {templates.map((t) => {
          const active = t.id === current;
          const p = t.defaultTheme.palette;
          return (
            <button
              type="button"
              key={t.id}
              onClick={() => {
                const c = getTemplateCatalog(t.id);
                if (c) {
                  onSwitch({
                    templateId: t.id,
                    theme: c.defaultTheme,
                    sections: c.defaultSections,
                  });
                }
              }}
              aria-pressed={active}
              className={cn(
                "flex flex-col gap-2 rounded-[var(--radius-md)] border p-3 text-left transition-all",
                active
                  ? "border-brand ring-2 ring-brand/25"
                  : "border-line hover:border-line-strong"
              )}
            >
              <div
                className="h-12 rounded-[var(--radius-sm)]"
                style={{
                  background: `linear-gradient(135deg, ${p.primary}, ${p.secondary} 60%, ${p.accent})`,
                }}
              />
              <span className="text-xs font-medium text-ink">{t.name}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted">
        Switching keeps your content and applies the new look.
      </p>
    </section>
  );
}
