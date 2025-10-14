export const DEFAULT_PAGE_SIZE = 100
export const CMS_CACHE_TIME = 60 * 60 // 60 minutes

export const clientAddons = {
  fetch: (request: unknown) =>
    fetch(request as Request, {
      next: {
        revalidate: CMS_CACHE_TIME,
        tags: ['cms-content'], // tag for cache invalidation
      },
    }),
}
