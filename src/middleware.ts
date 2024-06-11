import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Hmac } from "./classes";

export function middleware(request: NextRequest) {
  let hmacCookie = request.cookies.get("guilded-hmac");
  const hmac = Hmac.Sanitize(hmacCookie?.value);
  const pathname = request.nextUrl.pathname;

  if (!hmac && pathname.startsWith("/api")) {
    return Response.json({ success: false, message: "No hmac auth token found" }, { status: 401 });
  }

  const response = NextResponse.next();
  response.cookies.set("guilded-hmac", hmac);

  return response;
}
