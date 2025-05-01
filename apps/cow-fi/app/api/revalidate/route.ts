import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// Secret key for protecting the revalidation endpoint
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const tag = request.nextUrl.searchParams.get('tag') || 'cms-content'

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
    // Revalidate the tag
    revalidateTag(tag)
    return NextResponse.json({
      revalidated: true,
      message: `Cache for tag '${tag}' has been revalidated`,
      date: new Date().toISOString(),
    })
  } catch (err) {
    // If there was an error, return 500
    return NextResponse.json({ message: 'Error revalidating', error: (err as Error).message }, { status: 500 })
  }
}
