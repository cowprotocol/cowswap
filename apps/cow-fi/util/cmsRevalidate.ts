import { normalizeRevalidateRequest } from './cmsValidation'

export const CMS_REVALIDATE_ROUTES: ReadonlyArray<{ path: string; type?: 'layout' | 'page' }> = [
  { path: '/learn' },
  { path: '/learn/articles' },
  { path: '/learn/topics' },
  { path: '/learn/[article]' },
  { path: '/resources' },
  { path: '/resources/[campaign]', type: 'page' },
  { path: '/resources/[campaign]/[slug]', type: 'page' },
]

export function handleRevalidatePost({
  body,
  configuredSecret,
  providedSecret,
  revalidatePath,
  revalidateTag,
}: {
  body: unknown
  configuredSecret: string | undefined
  providedSecret: string | null
  revalidatePath: (path: string, type?: 'layout' | 'page') => void
  revalidateTag: (tag: string) => void
}): {
  body: Record<string, unknown>
  status: number
} {
  if (!configuredSecret) {
    return { status: 500, body: { message: 'Revalidation not configured properly' } }
  }

  if (providedSecret !== configuredSecret) {
    return { status: 401, body: { message: 'Invalid secret' } }
  }

  try {
    const { path, tag } = normalizeRevalidateRequest(body)

    revalidateTag(tag)

    for (const route of CMS_REVALIDATE_ROUTES) {
      revalidatePath(route.path, route.type)
    }

    if (path) {
      revalidatePath(path)
    }

    return {
      status: 200,
      body: {
        revalidated: true,
        message: `Cache for tag '${tag}' has been revalidated${path ? `, path '${path}' has been revalidated` : ''}`,
        date: new Date().toISOString(),
      },
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown revalidation error'

    return {
      status: 400,
      body: {
        message: 'Error revalidating',
        error: errorMessage,
      },
    }
  }
}
