import { deepEqual } from '@cowprotocol/common-utils'
import type { UpdateParamsPayload } from '@cowprotocol/widget-lib'

const THEME_QUERY_KEYS = ['theme', 'palette'] as const

export function applyThemeQuery(currentSearch: string, nextSearch: string): string {
  const current = new URLSearchParams(currentSearch)
  const next = new URLSearchParams(nextSearch)

  THEME_QUERY_KEYS.forEach((key) => {
    const value = next.get(key)

    if (value === null) {
      current.delete(key)
    } else {
      current.set(key, value)
    }
  })

  return current.toString()
}

// Browser API instead of useLocation(): the message handler outlives renders, and the trade route moves on its own
export function getCurrentLocationWithTheme(nextSearch: string): UpdateParamsPayload['urlParams'] {
  const [pathname, search = ''] = window.location.hash.slice(1).split('?')

  return { pathname, search: applyThemeQuery(search, nextSearch) }
}

export function isThemeOnlyWidgetUpdate(prev: UpdateParamsPayload | null, next: UpdateParamsPayload): boolean {
  if (!prev) return false

  const prevSearch = new URLSearchParams(prev.urlParams.search)
  const nextSearch = new URLSearchParams(next.urlParams.search)

  return (
    prev.urlParams.pathname === next.urlParams.pathname &&
    prev.hasProvider === next.hasProvider &&
    deepEqual(prev.appParams, next.appParams) &&
    THEME_QUERY_KEYS.some((key) => prevSearch.get(key) !== nextSearch.get(key)) &&
    withoutThemeQuery(prevSearch) === withoutThemeQuery(nextSearch)
  )
}

function withoutThemeQuery(search: URLSearchParams): string {
  const copy = new URLSearchParams(search)

  THEME_QUERY_KEYS.forEach((key) => copy.delete(key))
  copy.sort()

  return copy.toString()
}
