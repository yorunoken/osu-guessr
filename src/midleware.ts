import { NextRequest } from "next/server";

const locales = ["en", "tr"];

function getLocale(request: NextRequest) {
    const acceptLanguage = request.headers.get("accept-language");
    return acceptLanguage?.split(",")[0].split("-")[0] || "en";
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);

    if (pathnameHasLocale) return;

    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return Response.redirect(request.nextUrl);
}

export const config = {
    matcher: ["/((?!_next|api|favicon.ico).*)"],
};
