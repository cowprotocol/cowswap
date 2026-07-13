export const DEFAULT_PAGE_SIZE = 100
export const CMS_CACHE_TIME = 60 * 60 // 60 minutes

export const CMS_BASE_URL =
  process.env.NEXT_PUBLIC_CMS_BASE_URL || process.env.REACT_APP_CMS_BASE_URL || 'https://cms.cow.fi/api'

export const clientAddons = {
  fetch: (request: unknown) =>
    fetch(request as Request, {
      next: {
        revalidate: CMS_CACHE_TIME,
        tags: ['cms-content'], // tag for cache invalidation
      },
    }),
}
