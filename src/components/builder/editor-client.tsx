"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Loader2,
  CloudOff,
  Monitor,
  Smartphone,
  ExternalLink,
  Users,
  ClipboardList,
  MessageSquare,
  LayoutList,
  Palette,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { siteUrl, builderUrl } from "@/lib/env";
import { validateSubdomain } from "@/lib/subdomains";
import { SECTION_LIBRARY } from "@/lib/sections";
import { SectionList } from "@/components/builder/section-list";
import { SectionForm } from "@/components/builder/section-forms";
import { ThemePanel } from "@/components/builder/theme-panel";
import { TemplateSwitcher } from "@/components/builder/template-switcher";
import { PrivacyPanel } from "@/components/builder/privacy-panel";
import type { ChecklistItem } from "@/lib/validation/site";
import type {
  Site,
  SiteContent,
  SectionBlock,
  Theme,
  SitePrivacy,
  VerifyField,
  EditableSectionType,
} from "@/lib/types";

type SaveStatus = "idle" | "saving" | "saved" | "error" | "expired";
type SubStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "error";
type Tab = "content" | "design" | "settings";

interface Editable {
  templateId: string;
  content: SiteContent;
  sections: SectionBlock[];
  theme: Theme;
  privacy: SitePrivacy;
  sharedCode: string;
  verifyField: VerifyField | null;
}

function deriveTitle(content: SiteContent, fallback: string): string {
  const h = content.hero;
  if (h?.titleA?.trim()) {
    return h.titleB?.trim() ? `${h.titleA} & ${h.titleB}` : h.titleA;
  }
  return fallback;
}

export function EditorClient({ site }: { site: Site }) {
  const lang = site.defaultLanguage || "en";

  const [editable, setEditable] = useState<Editable>(() => ({
    templateId: site.templateId,
    content: site.content?.[lang] ?? {},
    sections: site.sections ?? [],
    theme: site.theme,
    privacy: site.privacy,
    sharedCode: site.sharedCode ?? "",
    verifyField: site.verifyField ?? null,
  }));

  const [subdomain, setSubdomain] = useState(site.subdomain);
  const [savedSubdomain, setSavedSubdomain] = useState(site.subdomain);
  const [availability, setAvailability] = useState<{
    value: string;
    status: "checking" | "available" | "taken" | "error";
    reason: string | null;
  } | null>(null);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [status, setStatus] = useState(site.status);
  const [publishing, setPublishing] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("content");
  const [selected, setSelected] = useState<EditableSectionType>(
    () => (site.sections?.[0]?.type as EditableSectionType) ?? "hero"
  );
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState(0);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<Editable | null>(null);

  const buildPayload = useCallback(
    (e: Editable) =>
      JSON.stringify({
        templateId: e.templateId,
        title: deriveTitle(e.content, site.title),
        content: { [lang]: e.content },
        sections: e.sections,
        theme: e.theme,
        privacy: e.privacy,
        sharedCode: e.sharedCode || null,
        verifyField: e.verifyField,
      }),
    [lang, site.title]
  );

  const scheduleSave = useCallback(
    (next: Editable) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      pendingRef.current = next;
      setSaveStatus("saving");
      saveTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/sites/${site.id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: buildPayload(next),
          });
          if (res.status === 401) {
            setSaveStatus("expired");
            return;
          }
          if (!res.ok) throw new Error("save failed");
          pendingRef.current = null;
          setSaveStatus("saved");
          setPreviewKey((k) => k + 1);
        } catch {
          setSaveStatus("error");
        }
      }, 700);
    },
    [site.id, buildPayload]
  );

  function update(partial: Partial<Editable>) {
    setEditable((prev) => {
      const next = { ...prev, ...partial };
      scheduleSave(next);
      return next;
    });
  }

  // Switch design: apply the new theme but RECONCILE sections by type so the
  // user's order/visibility and any added sections (e.g. gallery) survive.
  function switchTemplate(p: {
    templateId: string;
    theme: Theme;
    sections: SectionBlock[];
  }) {
    setEditable((prev) => {
      const existing = new Map(prev.sections.map((s) => [s.type, s]));
      const used = new Set<string>();
      const merged: SectionBlock[] = [];
      for (const d of p.sections) {
        const ex = existing.get(d.type);
        merged.push(ex ? { ...ex } : d);
        used.add(d.type);
      }
      for (const s of prev.sections) {
        if (!used.has(s.type)) {
          merged.push(s);
          used.add(s.type);
        }
      }
      const sections = merged.map((s, i) => ({ ...s, order: i }));
      const next = {
        ...prev,
        templateId: p.templateId,
        theme: p.theme,
        sections,
      };
      scheduleSave(next);
      return next;
    });
  }

  // Flush a pending edit on unmount (keepalive survives client nav + tab close).
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (pendingRef.current) {
        fetch(`/api/sites/${site.id}`, {
          method: "PATCH",
          keepalive: true,
          headers: { "content-type": "application/json" },
          body: buildPayload(pendingRef.current),
        }).catch(() => {});
      }
    };
  }, [site.id, buildPayload]);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (saveStatus === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [saveStatus]);

  // ---- subdomain availability + save ----
  useEffect(() => {
    const value = subdomain.trim().toLowerCase();
    if (value === savedSubdomain) return;
    if (!validateSubdomain(value).ok) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/sites/${site.id}/subdomain?value=${encodeURIComponent(value)}`
        );
        const data = await res.json();
        if (data.available) {
          const save = await fetch(`/api/sites/${site.id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ subdomain: value }),
          });
          if (save.ok) {
            setSavedSubdomain(value);
            setAvailability({ value, status: "available", reason: null });
            setPreviewKey((k) => k + 1);
          } else {
            setAvailability({ value, status: "taken", reason: "That web address is taken." });
          }
        } else {
          setAvailability({ value, status: "taken", reason: data.reason ?? "That web address is taken." });
        }
      } catch {
        setAvailability({ value, status: "error", reason: "Couldn't check right now — keep typing to retry." });
      }
    }, 500);
    return () => clearTimeout(t);
  }, [subdomain, savedSubdomain, site.id]);

  async function publish() {
    setPublishing(true);
    setChecklist(null);
    try {
      const res = await fetch(`/api/sites/${site.id}/publish`, { method: "POST" });
      if (res.status === 422) {
        setChecklist((await res.json()).checklist as ChecklistItem[]);
      } else if (res.ok) {
        setStatus("published");
        setToast("Published");
        setPreviewKey((k) => k + 1);
        setTimeout(() => setToast(null), 4000);
      } else {
        const data = await res.json().catch(() => ({}));
        setToast(data.error ?? "Couldn't publish.");
        setTimeout(() => setToast(null), 4000);
      }
    } finally {
      setPublishing(false);
    }
  }

  const isPublished = status === "published";
  const normSub = subdomain.trim().toLowerCase();
  let subStatus: SubStatus = "idle";
  let subReason: string | null = null;
  if (normSub !== savedSubdomain) {
    const c = validateSubdomain(normSub);
    if (!c.ok) {
      subStatus = "invalid";
      subReason = c.reason;
    } else if (availability && availability.value === normSub) {
      subStatus = availability.status;
      subReason = availability.reason;
    } else {
      subStatus = "checking";
    }
  }
  const liveHost = siteUrl(savedSubdomain).replace(/^https?:\/\//, "");
  const selectedPresent = editable.sections.some((s) => s.type === selected);
  const effectiveSelected: EditableSectionType = selectedPresent
    ? selected
    : ((editable.sections[0]?.type as EditableSectionType) ?? "hero");

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      {/* Toolbar */}
      <div className="sticky top-16 z-30 border-b border-line bg-canvas/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </Link>
            <span className="hidden truncate font-medium text-ink sm:inline">
              {deriveTitle(editable.content, site.title)}
            </span>
            <SaveIndicator status={saveStatus} />
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/sites/${site.id}/guests`}
              className="hidden items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink sm:inline-flex"
            >
              <Users className="h-4 w-4" />
              Guests
            </Link>
            <Link
              href={`/sites/${site.id}/responses`}
              className="hidden items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink sm:inline-flex"
            >
              <ClipboardList className="h-4 w-4" />
              Responses
            </Link>
            <Link
              href={`/sites/${site.id}/wishes`}
              className="hidden items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink sm:inline-flex"
            >
              <MessageSquare className="h-4 w-4" />
              Wishes
            </Link>
            <div className="flex rounded-full border border-line bg-surface p-0.5 lg:hidden">
              <TabBtn active={view === "edit"} onClick={() => setView("edit")}>
                Edit
              </TabBtn>
              <TabBtn active={view === "preview"} onClick={() => setView("preview")}>
                Preview
              </TabBtn>
            </div>
            <Button size="sm" onClick={publish} disabled={publishing}>
              {publishing ? "Publishing…" : isPublished ? "Re-publish" : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-0 lg:grid-cols-[minmax(0,460px)_1fr]">
        {/* Editing panel */}
        <section
          className={cn(
            "flex flex-col gap-6 px-4 py-6 sm:px-6 lg:border-r lg:border-line",
            view === "preview" && "hidden lg:flex"
          )}
        >
          {checklist && (
            <ChecklistPanel items={checklist} onClose={() => setChecklist(null)} />
          )}
          {saveStatus === "expired" && (
            <div
              role="alert"
              className="rounded-[var(--radius-lg)] border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-rose"
            >
              Your session expired.{" "}
              <a href={builderUrl("/sign-in")} className="font-medium underline underline-offset-2">
                Sign in again
              </a>{" "}
              to keep saving.
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 rounded-full border border-line bg-surface p-1">
            <PanelTab active={tab === "content"} onClick={() => setTab("content")} icon={<LayoutList className="h-4 w-4" />}>
              Content
            </PanelTab>
            <PanelTab active={tab === "design"} onClick={() => setTab("design")} icon={<Palette className="h-4 w-4" />}>
              Design
            </PanelTab>
            <PanelTab active={tab === "settings"} onClick={() => setTab("settings")} icon={<Settings2 className="h-4 w-4" />}>
              Settings
            </PanelTab>
          </div>

          {tab === "content" && (
            <div className="flex flex-col gap-6">
              <SectionList
                sections={editable.sections}
                selected={effectiveSelected}
                onSelect={setSelected}
                onChange={(next) => update({ sections: next })}
              />
              <div className="border-t border-line pt-5">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-faint">
                  {SECTION_LIBRARY[effectiveSelected]?.label ?? "Section"}
                </h2>
                <SectionForm
                  type={effectiveSelected}
                  content={editable.content}
                  siteId={site.id}
                  onChange={(next) => update({ content: next })}
                />
              </div>
            </div>
          )}

          {tab === "design" && (
            <div className="flex flex-col gap-8">
              <TemplateSwitcher
                current={editable.templateId}
                onSwitch={switchTemplate}
              />
              <ThemePanel
                theme={editable.theme}
                onChange={(t) => update({ theme: t })}
              />
            </div>
          )}

          {tab === "settings" && (
            <div className="flex flex-col gap-7">
              <Field
                label="Your site address"
                htmlFor="subdomain"
                error={
                  !isPublished &&
                  (subStatus === "invalid" || subStatus === "taken" || subStatus === "error")
                    ? subReason ?? undefined
                    : undefined
                }
                hint={
                  isPublished
                    ? "Your address is locked once published."
                    : subStatus === "available"
                      ? "Available ✓"
                      : subStatus === "checking"
                        ? "Checking…"
                        : `Lives at ${liveHost}`
                }
              >
                <div className="flex items-center overflow-hidden rounded-[var(--radius-md)] border border-line-strong bg-surface focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/25">
                  <input
                    id="subdomain"
                    value={subdomain}
                    disabled={isPublished}
                    onChange={(e) =>
                      setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                    }
                    className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    maxLength={40}
                    aria-label="Subdomain"
                  />
                  <span className="shrink-0 border-l border-line px-3 py-2.5 text-sm text-muted">
                    .cerelyx
                  </span>
                </div>
              </Field>

              <div className="flex flex-col gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
                  Who can see this site
                </h2>
                <PrivacyPanel
                  siteId={site.id}
                  privacy={editable.privacy}
                  sharedCode={editable.sharedCode}
                  verifyField={editable.verifyField}
                  onChange={(p) => update(p)}
                />
              </div>

              <Link
                href={`/sites/${site.id}/guests`}
                className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
              >
                <Users className="h-4 w-4" />
                Manage guest list
              </Link>
            </div>
          )}

          <div className="h-4" />
        </section>

        {/* Preview panel */}
        <section
          className={cn(
            "bg-[#efeae0] lg:sticky lg:top-[7.5rem] lg:h-[calc(100dvh-7.5rem)]",
            view === "edit" && "hidden lg:block"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-line/60 px-4 py-2.5">
              <div className="flex rounded-full border border-line bg-surface p-0.5">
                <DeviceBtn active={device === "desktop"} onClick={() => setDevice("desktop")} label="Desktop">
                  <Monitor className="h-4 w-4" />
                </DeviceBtn>
                <DeviceBtn active={device === "mobile"} onClick={() => setDevice("mobile")} label="Mobile">
                  <Smartphone className="h-4 w-4" />
                </DeviceBtn>
              </div>
              {isPublished && (
                <a
                  href={siteUrl(savedSubdomain)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
                >
                  Open live <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <div className="flex flex-1 items-start justify-center overflow-auto p-4">
              <div
                className={cn(
                  "overflow-hidden rounded-[1.25rem] border border-line bg-white shadow-[var(--shadow-lift)] transition-all",
                  device === "mobile" ? "w-[390px] max-w-full" : "w-full"
                )}
                style={{ height: device === "mobile" ? 760 : "100%" }}
              >
                <iframe
                  key={previewKey}
                  src={`/sites/${site.id}/preview?v=${previewKey}`}
                  title="Live preview"
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-lift)]"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  const map = {
    saving: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, text: "Saving…", cls: "text-muted" },
    saved: { icon: <Check className="h-3.5 w-3.5" />, text: "Saved", cls: "text-brand" },
    error: { icon: <CloudOff className="h-3.5 w-3.5" />, text: "Couldn't save", cls: "text-rose" },
    expired: { icon: <CloudOff className="h-3.5 w-3.5" />, text: "Session expired", cls: "text-rose" },
  } as const;
  const s = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", s.cls)}>
      {s.icon}
      {s.text}
    </span>
  );
}

function ChecklistPanel({
  items,
  onClose,
}: {
  items: ChecklistItem[];
  onClose: () => void;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-gold/40 bg-gold-soft/50 p-5">
      <h3 className="font-display text-lg text-ink">A few things to finish first</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((i) => (
          <li key={i.field} className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
                i.ok ? "bg-brand text-white" : "border border-rose text-rose"
              )}
            >
              {i.ok ? "✓" : "!"}
            </span>
            <span className={i.ok ? "text-muted line-through" : "text-ink"}>{i.label}</span>
          </li>
        ))}
      </ul>
      <button onClick={onClose} className="mt-4 text-sm font-medium text-brand hover:underline">
        Got it
      </button>
    </div>
  );
}

function PanelTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-brand text-white" : "text-muted hover:text-ink"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function TabBtn({
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
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-brand text-white" : "text-muted"
      )}
    >
      {children}
    </button>
  );
}

function DeviceBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 w-9 items-center justify-center rounded-full transition-colors",
        active ? "bg-brand text-white" : "text-muted hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}
