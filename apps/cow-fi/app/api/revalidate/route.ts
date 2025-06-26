import { revalidateTag, revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// Secret key for protecting the revalidation endpoint
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const tag = request.nextUrl.searchParams.get('tag') || 'cms-content'
  const path = request.nextUrl.searchParams.get('path')

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
    // Revalidate the tag for data freshness
    revalidateTag(tag)

    // Always revalidate the main learn page to ensure it's fresh
    revalidatePath('/learn')

    // Revalidate the dynamic article route (this updates the manifest)
    revalidatePath('/learn/[article]')

    // If a specific path was provided, revalidate it to update the route manifest
    if (path) {
      // Ensure the incoming path starts with a slash
      const formattedPath = path.startsWith('/') ? path : `/${path}`

      // Revalidate the specific article page (e.g. /learn/my-new-article)
      revalidatePath(formattedPath)
    }

    return NextResponse.json({
      revalidated: true,
      message: `Cache for tag '${tag}' has been revalidated${path ? `, path '${path}' has been revalidated` : ''}`,
      date: new Date().toISOString(),
    })
  } catch (err) {
    // If there was an error, return 500
    return NextResponse.json({ message: 'Error revalidating', error: (err as Error).message }, { status: 500 })
  }
}
