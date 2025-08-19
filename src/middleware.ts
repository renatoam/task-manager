import { NextRequest } from "next/server"
import { authenticate } from "./app/shared/validation/authenticate"

export const config = {
  matcher: [
    '/server/auth/signout',
    '/server/auth/me',
  ],
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/server/auth/signout') || pathname.startsWith('/server/auth/me')) {
    return authenticate(request)
  }
}
