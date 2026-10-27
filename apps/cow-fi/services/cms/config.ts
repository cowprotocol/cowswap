export const DEFAULT_PAGE_SIZE = 100
export const CMS_CACHE_TIME = 60 * 60 // 60 minutes
const CMS_REQUEST_TIMEOUT_MS = 5_000

export const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_BASE_URL || 'https://cms.cow.fi/api'

export const clientAddons = {
  fetch: (request: Request) =>
    fetch(request, {
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(CMS_REQUEST_TIMEOUT_MS)]),
      next: {
        revalidate: CMS_CACHE_TIME,
        tags: ['cms-content'], // tag for cache invalidation
      },
    }),
}
