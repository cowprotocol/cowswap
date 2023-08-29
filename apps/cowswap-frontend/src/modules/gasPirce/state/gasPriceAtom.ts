import { atom } from 'jotai'

interface GasPriceState {
  lastUpdate: string
  average: string | null
  fast: string | null
  slow: string | null
}

export const gasPriceAtom = atom<GasPriceState | null>(null)
