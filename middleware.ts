import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let res = NextResponse.next({ request: req });
  const sb = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await sb.auth.getUser();
  const isLogin = req.nextUrl.pathname === "/admin/login";
  if (!data.user && req.nextUrl.pathname.startsWith("/anteprima")) return NextResponse.redirect(new URL("/admin/login", req.url));
  if (!data.user && !isLogin) return NextResponse.redirect(new URL("/admin/login", req.url));
  if (data.user && isLogin) return NextResponse.redirect(new URL("/admin", req.url));
  return res;
}

export const config = { matcher: ["/admin/:path*", "/anteprima/:path*"] };
