import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { NOTE_NAME_PATTERN, isRawRequest } from "@/lib/note-name";

function withCommonHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export function proxy(request: NextRequest): NextResponse {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  if (pathname.startsWith("/_next") || pathname === "/favicon.ico" || pathname === "/favicon.svg") {
    return NextResponse.next();
  }

  const note = pathname.slice(1);
  const isNotePath = note.length > 0 && NOTE_NAME_PATTERN.test(note);

  if (request.method === "POST" && isNotePath) {
    const rewriteUrl = nextUrl.clone();
    rewriteUrl.pathname = `/api${pathname}`;
    return withCommonHeaders(NextResponse.rewrite(rewriteUrl));
  }

  if (request.method === "GET" && isNotePath && isRawRequest(nextUrl.searchParams, request.headers.get("user-agent"))) {
    const rewriteUrl = nextUrl.clone();
    rewriteUrl.pathname = `/api${pathname}`;
    return withCommonHeaders(NextResponse.rewrite(rewriteUrl));
  }

  return withCommonHeaders(NextResponse.next());
}

export const config = {
  matcher: "/:path*",
};
