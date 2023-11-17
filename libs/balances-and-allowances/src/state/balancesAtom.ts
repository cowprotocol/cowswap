import { atom } from 'jotai'
import type { BigNumber } from '@ethersproject/bignumber'

export interface BalancesState {
  isLoading: boolean
  values: { [address: string]: BigNumber | undefined }
}

export const balancesAtom = atom<BalancesState>({ isLoading: false, values: {} })
