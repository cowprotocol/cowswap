import { atom } from 'jotai'

export interface BalancesState {
  isLoading: boolean
  values: { [address: string]: bigint }
}

export const balancesAtom = atom<BalancesState>({ isLoading: false, values: {} })
