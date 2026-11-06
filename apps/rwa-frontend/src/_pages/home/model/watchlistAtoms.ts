import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

/** Tickers */
export const watchlistAtom = atomWithStorage<string[]>('rwaWatchlist:v1', [])

export const toggleWatchlistAtom = atom(null, (get, set, ticker: string) => {
  const watchlist = get(watchlistAtom)

  set(watchlistAtom, watchlist.includes(ticker) ? watchlist.filter((item) => item !== ticker) : [...watchlist, ticker])
})
