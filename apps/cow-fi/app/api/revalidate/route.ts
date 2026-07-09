import { revalidateTag, revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { normalizeRevalidateRequest } from '../../../util/cmsValidation'

// Secret key for protecting the revalidation endpoint
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET

function getSecretFromHeaders(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization')

  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length)
  }

  return request.headers.get('x-revalidate-secret')
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ message: 'Use POST for revalidation requests' }, { status: 405 })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = getSecretFromHeaders(request)

  // Validate that the secret is configured
  if (!REVALIDATE_SECRET) {
    console.error('REVALIDATE_SECRET is not set in environment variables')
    return NextResponse.json({ message: 'Revalidation not configured properly' }, { status: 500 })
  }

  // Check for secret to confirm this is a valid request
  if (secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  try {
    const requestBody: unknown = await request.json()
    const { path, tag } = normalizeRevalidateRequest(requestBody)

    // Revalidate the tag for data freshness
    revalidateTag(tag)

    // Always revalidate the main learn page to ensure it's fresh
    revalidatePath('/learn')

    // Revalidate learn sub-pages for comprehensive cache refresh
    revalidatePath('/learn/articles')
    revalidatePath('/learn/topics')

    // Revalidate the dynamic article route (this updates the manifest)
    revalidatePath('/learn/[article]')

    // If a specific path was provided, revalidate it to update the route manifest
    if (path) revalidatePath(path)

    return NextResponse.json({
      revalidated: true,
      message: `Cache for tag '${tag}' has been revalidated${path ? `, path '${path}' has been revalidated` : ''}`,
      date: new Date().toISOString(),
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown revalidation error'
    return NextResponse.json({ message: 'Error revalidating', error: errorMessage }, { status: 400 })
  }
}
