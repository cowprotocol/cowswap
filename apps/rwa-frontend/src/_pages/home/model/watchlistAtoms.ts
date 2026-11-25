import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

import { trackEvent } from '@/shared/lib/analytics'

const WATCHLIST_STORAGE_KEY = 'rwaWatchlist:v1'

const watchlistStorage = createJSONStorage<string[]>()

/** Tickers */
export const watchlistAtom = atomWithStorage<string[]>(WATCHLIST_STORAGE_KEY, [], watchlistStorage)

export function readStoredWatchlist(): string[] {
  return watchlistStorage.getItem(WATCHLIST_STORAGE_KEY, [])
}

export const toggleWatchlistAtom = atom(null, (get, set, ticker: string) => {
  const watchlist = get(watchlistAtom)
  const isWatched = !watchlist.includes(ticker)

  set(watchlistAtom, isWatched ? [...watchlist, ticker] : watchlist.filter((item) => item !== ticker))
  trackEvent('watchlist_toggle', { ticker, isWatched })
})
