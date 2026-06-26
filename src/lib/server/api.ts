import { NextResponse } from "next/server";
import { SiteError } from "@/lib/server/sites";

/** Map thrown errors from the server layer to JSON HTTP responses. */
export function errorResponse(err: unknown): NextResponse {
  if (err instanceof SiteError) {
    const status =
      err.code === "NOT_FOUND"
        ? 404
        : err.code === "FORBIDDEN"
          ? 403
          : err.code === "SUBDOMAIN_TAKEN" || err.code === "INVALID_SUBDOMAIN"
            ? 409
            : 400;
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status }
    );
  }
  if (err instanceof Error && err.message === "UNAUTHENTICATED") {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  console.error("[api] unexpected error:", err);
  return NextResponse.json(
    { error: "Something went wrong." },
    { status: 500 }
  );
}
