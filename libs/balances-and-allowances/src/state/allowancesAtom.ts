import { atom } from 'jotai'

import type { BigNumber } from '@ethersproject/bignumber'

export interface AllowancesState {
  isLoading: boolean
  values: { [address: string]: BigNumber | undefined }
}

export const allowancesState = atom<AllowancesState>({ isLoading: false, values: {} })
