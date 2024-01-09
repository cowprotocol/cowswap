import { Command } from 'types'
import { media } from 'theme/styles/media'

export type Breakpoints = 'xl' | 'lg' | 'md' | 'sm' | 'xs'

const extrapolatedScreenSize = {
  sm: media.xSmallScreen,
  md: media.smallScreenUp,
  lg: media.desktopScreen,
  xl: media.desktopScreenLarge,
}

export const MEDIA_QUERY_MATCHES: Array<{ name: Breakpoints; query: string }> = [
  // must be in descending order for .find to match from largest to smallest
  // as sm will also match for xl and lg, for example
  {
    name: 'xl',
    query: `(min-width:${extrapolatedScreenSize.xl})`,
  },
  {
    name: 'lg',
    query: `(min-width:${extrapolatedScreenSize.lg})`,
  },
  {
    name: 'md',
    query: `(min-width:${extrapolatedScreenSize.md})`,
  },
  {
    name: 'sm',
    query: `(min-width:${extrapolatedScreenSize.sm})`,
  },
  // anything smaller -- xs
]

const DEFAULT_QUERY_NAME: Breakpoints = 'xs'

export const getMatchingScreenSize = (): Breakpoints =>
  MEDIA_QUERY_MATCHES.find(({ query }) => window.matchMedia(query).matches)?.name || DEFAULT_QUERY_NAME

export const MEDIA_QUERIES = MEDIA_QUERY_MATCHES.map(({ query }) => query)
export const MEDIA_QUERY_NAMES = MEDIA_QUERY_MATCHES.map(({ name }) => name).concat(DEFAULT_QUERY_NAME)

export const subscribeToScreenSizeChange = (callback: (event: MediaQueryListEvent) => void): Command => {
  const mediaQueryLists = MEDIA_QUERIES.map((query) => window.matchMedia(query))

  mediaQueryLists.forEach((mql) => mql.addEventListener('change', callback))

  return (): void => mediaQueryLists.forEach((mql) => mql.removeEventListener('change', callback))
}
