import { NextRequest, NextResponse } from "next/server";
import { generateRandomNoteName, isValidNoteName } from "@/lib/note-name";
import { deleteNote, readNote, writeNote } from "@/lib/note";

export const runtime = "nodejs";

function withCommonHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

function redirectToRandomNote(request: NextRequest): NextResponse {
  return withCommonHeaders(NextResponse.redirect(new URL(`/${generateRandomNoteName()}`, request.url)));
}

async function getRequestText(request: NextRequest): Promise<string> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.startsWith("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    const text = formData.get("text");

    if (typeof text === "string") {
      return text;
    }
  }

  return request.text();
}

type RouteContext = {
  params: Promise<{
    note: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { note } = await context.params;

  if (!isValidNoteName(note)) {
    return redirectToRandomNote(request);
  }

  const text = await readNote(note);

  if (text === null) {
    return withCommonHeaders(new NextResponse(null, { status: 404 }));
  }

  return withCommonHeaders(
    new NextResponse(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    }),
  );
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { note } = await context.params;

  if (!isValidNoteName(note)) {
    return redirectToRandomNote(request);
  }

  const text = await getRequestText(request);

  if (text.length === 0) {
    await deleteNote(note);
  } else {
    await writeNote(note, text);
  }

  return withCommonHeaders(new NextResponse(null, { status: 200 }));
}
