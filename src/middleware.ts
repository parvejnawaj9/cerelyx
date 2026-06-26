import { NextResponse, type NextRequest } from "next/server";
import { getHost, classifyHost } from "@/lib/host";
import { builderUrl, adminUrl } from "@/lib/env";

/**
 * Multi-tenant host routing (brief §2). Edge-safe: pure string logic, no DB.
 *
 *   apex / www        → marketing (served at the real "/")
 *   app.<root>        → builder  ("/" → "/dashboard")
 *   admin.<root>      → admin    ("/" → "/admin")  [built in Phase 4]
 *   <site>.<root>     → published guest site (rewrite "/*" → "/s/<site>/*")
 *
 * The real requested host is read from X-Forwarded-Host (App Hosting proxy)
 * with a fallback to Host. We only rewrite the internal path — the browser URL
 * never changes — except for cross-surface bounces, which redirect each flow to
 * its canonical host so the shared session cookie and surface separation stay
 * consistent. The actual site lookup happens server-side in /s/[subdomain].
 */
export function middleware(req: NextRequest) {
  const host = getHost(req.headers);
  const { kind, subdomain } = classifyHost(host);
  const url = req.nextUrl;
  const path = url.pathname;
  const withQuery = `${path}${url.search}`;

  const isBuilderPath =
    path === "/dashboard" ||
    path.startsWith("/dashboard/") ||
    path === "/sites" ||
    path.startsWith("/sites/") ||
    path === "/new";
  const isAuthPath = path === "/sign-in" || path === "/sign-up";
  const isAdminPath = path === "/admin" || path.startsWith("/admin/");

  switch (kind) {
    case "marketing": {
      // Keep builder, auth and admin flows on their canonical hosts.
      if (isBuilderPath || isAuthPath) {
        return NextResponse.redirect(builderUrl(withQuery));
      }
      if (isAdminPath) {
        return NextResponse.redirect(adminUrl(withQuery));
      }
      return NextResponse.next();
    }

    case "builder": {
      if (isAdminPath) {
        return NextResponse.redirect(adminUrl(withQuery));
      }
      if (path === "/") {
        const to = url.clone();
        to.pathname = "/dashboard";
        return NextResponse.rewrite(to);
      }
      return NextResponse.next();
    }

    case "admin": {
      // The admin host only serves /admin; builder/auth flows bounce to app.
      if (isBuilderPath || isAuthPath) {
        return NextResponse.redirect(builderUrl(withQuery));
      }
      const to = url.clone();
      to.pathname = path === "/" ? "/admin" : path;
      return NextResponse.rewrite(to);
    }

    case "site": {
      const to = url.clone();
      to.pathname = `/s/${subdomain}${path === "/" ? "" : path}`;
      return NextResponse.rewrite(to);
    }

    default:
      return NextResponse.next();
  }
}

export const config = {
  // Run on everything except API routes, Next internals, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
