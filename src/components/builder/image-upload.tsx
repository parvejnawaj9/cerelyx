"use client";

import { useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { storageUrl } from "@/lib/images/url";
import { cn } from "@/lib/cn";

async function uploadImage(siteId: string, file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`/api/sites/${siteId}/images`, {
    method: "POST",
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Upload failed.");
  return data.path as string;
}

export function ImageField({
  siteId,
  value,
  onChange,
}: {
  siteId: string;
  value?: string;
  onChange: (path: string | undefined) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadImage(siteId, file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={storageUrl(value)}
          alt="Selected"
          className="h-16 w-24 rounded-[var(--radius-sm)] border border-line object-cover"
        />
        <label className="cursor-pointer text-sm font-medium text-brand hover:underline">
          Replace
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => handle(e.target.files?.[0])}
          />
        </label>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-sm text-muted hover:text-rose"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className={cn(
          "flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-line-strong bg-surface px-4 py-6 text-sm text-muted transition-colors hover:border-brand hover:text-ink",
          busy && "pointer-events-none opacity-60"
        )}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImagePlus className="h-4 w-4" />
        )}
        {busy ? "Uploading…" : "Upload a photo"}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={busy}
          onChange={(e) => handle(e.target.files?.[0])}
        />
      </label>
      {error && <p className="text-xs text-rose">{error}</p>}
    </div>
  );
}

export function ImageGrid({
  siteId,
  values,
  onChange,
  max = 12,
}: {
  siteId: string;
  values: string[];
  onChange: (paths: string[]) => void;
  max?: number;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const room = max - values.length;
      const picked = Array.from(files).slice(0, Math.max(0, room));
      const paths: string[] = [];
      for (const f of picked) paths.push(await uploadImage(siteId, f));
      onChange([...values, ...paths]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {values.map((p) => (
          <div key={p} className="group relative aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={storageUrl(p)}
              alt=""
              className="h-full w-full rounded-[var(--radius-sm)] border border-line object-cover"
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== p))}
              aria-label="Remove photo"
              className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {values.length < max && (
          <label
            className={cn(
              "flex aspect-square cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-line-strong text-muted transition-colors hover:border-brand hover:text-ink",
              busy && "pointer-events-none opacity-60"
            )}
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ImagePlus className="h-5 w-5" />
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={busy}
              onChange={(e) => add(e.target.files)}
            />
          </label>
        )}
      </div>
      {error && <p className="text-xs text-rose">{error}</p>}
    </div>
  );
}
