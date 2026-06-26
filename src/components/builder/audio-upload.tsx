"use client";

import { useState } from "react";
import { Music2, Loader2 } from "lucide-react";
import { storageUrl } from "@/lib/images/url";
import { cn } from "@/lib/cn";

async function uploadAudio(siteId: string, file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`/api/sites/${siteId}/audio`, {
    method: "POST",
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Upload failed.");
  return data.path as string;
}

/** Upload an audio track to Storage (or replace/remove an uploaded one). */
export function AudioField({
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
      onChange(await uploadAudio(siteId, file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  if (value) {
    return (
      <div className="flex flex-col gap-2">
        <audio controls src={storageUrl(value)} className="w-full">
          <track kind="captions" />
        </audio>
        <div className="flex items-center gap-3 text-sm">
          <label className="cursor-pointer font-medium text-brand hover:underline">
            Replace
            <input
              type="file"
              accept="audio/*"
              className="sr-only"
              onChange={(e) => handle(e.target.files?.[0])}
            />
          </label>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-muted hover:text-rose"
          >
            Remove
          </button>
        </div>
        {error && <p className="text-xs text-rose">{error}</p>}
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
          <Music2 className="h-4 w-4" />
        )}
        {busy ? "Uploading…" : "Upload an audio file"}
        <input
          type="file"
          accept="audio/*"
          className="sr-only"
          disabled={busy}
          onChange={(e) => handle(e.target.files?.[0])}
        />
      </label>
      {error && <p className="text-xs text-rose">{error}</p>}
    </div>
  );
}
