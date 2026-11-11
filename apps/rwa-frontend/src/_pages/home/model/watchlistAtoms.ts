import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { trackEvent } from '@/shared/lib/analytics'

/** Tickers */
export const watchlistAtom = atomWithStorage<string[]>('rwaWatchlist:v1', [])

export const toggleWatchlistAtom = atom(null, (get, set, ticker: string) => {
  const watchlist = get(watchlistAtom)
  const isWatched = !watchlist.includes(ticker)

  set(watchlistAtom, isWatched ? [...watchlist, ticker] : watchlist.filter((item) => item !== ticker))
  trackEvent('watchlist_toggle', { ticker, isWatched })
})
