import { atom } from 'jotai'

export interface AllowancesState {
  isLoading: boolean
  values: { [address: string]: bigint }
}

export const allowancesState = atom<AllowancesState>({ isLoading: false, values: {} })
