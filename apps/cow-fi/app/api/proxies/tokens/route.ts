import { NextRequest, NextResponse } from 'next/server'

const UNISWAP_GRAPHQL_URL = 'https://api.uniswap.org/v1/graphql'
const UNISWAP_ORIGIN = 'https://app.uniswap.org'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text()

  const upstreamResponse = await fetch(UNISWAP_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'content-type': request.headers.get('content-type') || 'application/json',
      origin: UNISWAP_ORIGIN,
      referer: `${UNISWAP_ORIGIN}/`,
    },
    body,
    cache: 'no-store',
  })

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: {
      'content-type': upstreamResponse.headers.get('content-type') || 'application/json',
    },
  })
}
