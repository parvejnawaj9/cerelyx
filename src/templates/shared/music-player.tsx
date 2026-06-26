"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";

/**
 * A floating background-music control. Starts silent (paused) — audio only ever
 * begins after the guest taps, satisfying browser autoplay norms and a11y. The
 * single button toggles play/pause with a clear label and icon.
 */
export function MusicPlayer({ src, title }: { src: string; title?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      return;
    }
    try {
      setLoading(true);
      await el.play();
      setPlaying(true);
    } catch {
      // Autoplay/permission failure — leave it paused.
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 print:hidden">
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="none"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? `Pause ${title || "music"}` : `Play ${title || "music"}`}
        className="flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100"
        style={{ backgroundColor: "var(--site-primary)" }}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : playing ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
        <span className="max-w-[8rem] truncate">{title || "Music"}</span>
      </button>
    </div>
  );
}
