import { type NextRequest, NextResponse } from 'next/server'

// Asset URLs use upper-case tickers: one page, and one ISR cache entry, per asset
export function proxy(request: NextRequest): NextResponse {
  const [, , ticker = ''] = request.nextUrl.pathname.split('/')
  const upperTicker = ticker.toUpperCase()

  if (ticker === upperTicker) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/asset/${upperTicker}`

  return NextResponse.redirect(url, 308)
}

export const config = {
  matcher: '/asset/:ticker',
}
