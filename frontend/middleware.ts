import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  console.log("ПЕРЕВІРКА ПРАЦЮЄ!");
  const token = request.cookies.get("user_token")?.value;

  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");

  if (isAdminPage && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
