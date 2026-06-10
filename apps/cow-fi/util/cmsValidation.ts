const CMS_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const LEARN_REVALIDATE_PATH_PATTERN =
  /^\/learn(?:\/(?:articles(?:\/\d+)?|topics|topic\/[a-z0-9]+(?:-[a-z0-9]+)*|[a-z0-9]+(?:-[a-z0-9]+)*))?$/

export const CMS_REVALIDATE_TAG = 'cms-content'
export const DEFAULT_SEARCH_PAGE = 0
export const DEFAULT_SEARCH_PAGE_SIZE = 10
export const MAX_SEARCH_PAGE = 100
export const MAX_SEARCH_PAGE_SIZE = 100
export const MAX_SEARCH_TERM_LENGTH = 100

function isRecord(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function readOptionalNumber(value: unknown, fallback: number, max: number): number {
  if (typeof value === 'undefined') return fallback
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new Error('Pagination parameters must be non-negative integers')
  }

  return Math.min(value, max)
}

export function isValidCmsSlug(slug: string): boolean {
  return CMS_SLUG_PATTERN.test(slug)
}

export function isAllowedRevalidatePath(path: string): boolean {
  return LEARN_REVALIDATE_PATH_PATTERN.test(path)
}

export function normalizeCmsSlug(slug: string): string | null {
  const trimmedSlug = slug.trim()

  return isValidCmsSlug(trimmedSlug) ? trimmedSlug : null
}

export function normalizeSearchArticlesInput(input: unknown): {
  searchTerm: string
  page: number
  pageSize: number
} {
  if (!isRecord(input)) {
    throw new Error('Search input must be an object')
  }

  if (typeof input.searchTerm !== 'string') {
    throw new Error('Search term must be a string')
  }

  const searchTerm = input.searchTerm.trim()
  const page = readOptionalNumber(input.page, DEFAULT_SEARCH_PAGE, MAX_SEARCH_PAGE)
  const pageSize = readOptionalNumber(input.pageSize, DEFAULT_SEARCH_PAGE_SIZE, MAX_SEARCH_PAGE_SIZE)

  if (searchTerm.length === 0) {
    return {
      searchTerm,
      page,
      pageSize,
    }
  }

  if (searchTerm.length > MAX_SEARCH_TERM_LENGTH) {
    throw new Error(`Search term must be at most ${MAX_SEARCH_TERM_LENGTH} characters`)
  }

  return {
    searchTerm,
    page,
    pageSize,
  }
}

export function normalizeRevalidateRequest(input: unknown): {
  path: string | null
  tag: string
} {
  if (!isRecord(input)) {
    throw new Error('Revalidation body must be an object')
  }

  const tag = typeof input.tag === 'undefined' ? CMS_REVALIDATE_TAG : input.tag

  if (tag !== CMS_REVALIDATE_TAG) {
    throw new Error(`Unsupported revalidation tag "${String(tag)}"`)
  }

  if (typeof input.path === 'undefined') {
    return { path: null, tag }
  }

  if (typeof input.path !== 'string') {
    throw new Error('Revalidation path must be a string')
  }

  const path = input.path.startsWith('/') ? input.path : `/${input.path}`

  if (!isAllowedRevalidatePath(path)) {
    throw new Error(`Unsupported revalidation path "${path}"`)
  }

  return { path, tag }
}
