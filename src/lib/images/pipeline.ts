import sharp, { type Sharp } from "sharp";

/**
 * Image compression pipeline (brief §10): heavy compression while preserving
 * high visual quality. Produces responsive AVIF + WebP variants and a tiny
 * blur placeholder, and strips EXIF (sharp drops metadata on output unless
 * .withMetadata() is called; .rotate() bakes in orientation first).
 *
 * Server-only (sharp is a native module). Wired into the upload route in Phase 2;
 * present and correct now so that path needs no rework.
 */

export interface ImageVariant {
  width: number;
  format: "avif" | "webp";
  buffer: Buffer;
  contentType: string;
}

export interface ProcessedImage {
  variants: ImageVariant[];
  blurDataURL: string;
  width: number;
  height: number;
}

/** Responsive widths we generate (capped to the source width). */
export const RESPONSIVE_WIDTHS = [480, 800, 1200, 1600, 2000] as const;

export async function processImage(input: Buffer): Promise<ProcessedImage> {
  // Decode once; clone the rotated pipeline for every output (no re-decode).
  const base = sharp(input, { failOn: "none" }).rotate();
  const meta = await base.metadata();
  const knownWidth = meta.width;
  const srcWidth = knownWidth ?? Math.max(...RESPONSIVE_WIDTHS);
  const srcHeight = meta.height ?? 0;

  // With an unknown source width, emit a single variant rather than fabricating
  // duplicate widths from a placeholder.
  const widths: number[] = knownWidth
    ? RESPONSIVE_WIDTHS.filter((w) => w <= srcWidth)
    : [];
  if (widths.length === 0) widths.push(srcWidth);

  const variants: ImageVariant[] = [];
  for (const target of widths) {
    const resized = base.clone().resize({ width: target, withoutEnlargement: true });
    const [avif, webp] = await Promise.all([
      resized.clone().avif({ quality: 50, effort: 4 }).toBuffer({ resolveWithObject: true }),
      resized.clone().webp({ quality: 74 }).toBuffer({ resolveWithObject: true }),
    ]);
    // Use the ACTUAL output width so srcset/sizing math is never wrong.
    variants.push({ width: avif.info.width, format: "avif", buffer: avif.data, contentType: "image/avif" });
    variants.push({ width: webp.info.width, format: "webp", buffer: webp.data, contentType: "image/webp" });
  }

  const blurDataURL = await blurFrom(base);
  return { variants, blurDataURL, width: srcWidth, height: srcHeight };
}

/** Detected image format from the bytes (not the client-asserted MIME). */
export async function probeFormat(input: Buffer): Promise<string | undefined> {
  try {
    return (await sharp(input, { failOn: "none" }).metadata()).format;
  } catch {
    return undefined;
  }
}

/**
 * Compress a single uploaded image to a heavily-optimized WebP (EXIF stripped,
 * orientation baked in, capped width) for storing + serving. Used by the upload
 * route; templates then serve it through next/image.
 */
export async function compressForUpload(
  input: Buffer,
  maxWidth = 2000
): Promise<{ buffer: Buffer; contentType: string; width: number; height: number }> {
  const out = await sharp(input, { failOn: "none" })
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });
  return {
    buffer: out.data,
    contentType: "image/webp",
    width: out.info.width,
    height: out.info.height,
  };
}

async function blurFrom(pipeline: Sharp): Promise<string> {
  const tiny = await pipeline
    .clone()
    .resize({ width: 16 })
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${tiny.toString("base64")}`;
}

/** A ~16px blurred WebP data URL for use as a Next/Image blur placeholder. */
export async function generateBlurDataURL(input: Buffer): Promise<string> {
  return blurFrom(sharp(input, { failOn: "none" }).rotate());
}
