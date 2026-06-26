"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/cn";

export interface TemplateOption {
  id: string;
  name: string;
  description: string;
  category: string;
  palette: { primary: string; secondary: string; accent: string; gold: string };
}

export function NewSiteForm({
  templates,
  initialTemplateId,
}: {
  templates: TemplateOption[];
  initialTemplateId?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState(
    initialTemplateId && templates.some((t) => t.id === initialTemplateId)
      ? initialTemplateId
      : (templates[0]?.id ?? "")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give your event a name to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const eventType =
        templates.find((t) => t.id === templateId)?.category ?? "custom";
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: title.trim(), templateId, eventType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't create the site.");
      router.push(`/sites/${data.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={create} className="flex flex-col gap-8">
      <Field
        label="What are we celebrating?"
        htmlFor="title"
        hint="You can change this any time."
        error={error ?? undefined}
      >
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Aarav & Priya's Wedding"
          autoFocus
          maxLength={120}
        />
      </Field>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-ink">Choose a design</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map((t) => {
            const selected = t.id === templateId;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                aria-pressed={selected}
                className={cn(
                  "relative flex flex-col gap-3 rounded-[var(--radius-lg)] border bg-surface p-4 text-left transition-all",
                  selected
                    ? "border-brand ring-2 ring-brand/25"
                    : "border-line hover:border-line-strong"
                )}
              >
                {selected && (
                  <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
                <div
                  className="h-24 rounded-[var(--radius-md)]"
                  style={{
                    background: `linear-gradient(135deg, ${t.palette.primary}, ${t.palette.secondary} 60%, ${t.palette.accent})`,
                  }}
                />
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-ink">{t.name}</span>
                  <span className="text-xs leading-relaxed text-muted">
                    {t.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-faint">
          More designs are on the way — you&apos;ll be able to switch any time.
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Creating…" : "Create site"}
        </Button>
      </div>
    </form>
  );
}
