import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Apply only for page/document requests (HTML). This avoids breaking CSS/JS.
  const accept = req.headers.get("accept") || "";
  if (accept.includes("text/html")) {
    res.headers.set("Content-Type", "text/html; charset=utf-8");
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};