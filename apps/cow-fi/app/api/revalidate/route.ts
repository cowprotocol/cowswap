import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { getUnauthorizedRevalidateResponse, handleRevalidatePost } from '../../../util/cmsRevalidate'

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ message: 'Use POST for revalidation requests' }, { status: 405 })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const configuredSecret = process.env.REVALIDATE_SECRET
  const providedSecret = getSecretFromHeaders(request)
  const unauthorized = getUnauthorizedRevalidateResponse(configuredSecret, providedSecret)

  if (unauthorized) {
    return NextResponse.json(unauthorized.body, { status: unauthorized.status })
  }

  let body: unknown

  try {
    body = await request.json()
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown revalidation error'
    return NextResponse.json({ message: 'Error revalidating', error: errorMessage }, { status: 400 })
  }

  const result = handleRevalidatePost({
    body,
    configuredSecret,
    providedSecret,
    revalidatePath,
    revalidateTag,
  })

  return NextResponse.json(result.body, { status: result.status })
}

function getSecretFromHeaders(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization')

  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length)
  }

  return request.headers.get('x-revalidate-secret')
}
