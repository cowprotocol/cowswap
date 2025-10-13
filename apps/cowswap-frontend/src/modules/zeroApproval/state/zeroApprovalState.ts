import { atom } from 'jotai'

import { Currency } from '@uniswap/sdk-core'

export interface ZeroApprovalState {
  isApproving: boolean
  currency?: Currency
}

export const zeroApprovalState = atom<ZeroApprovalState>({
  isApproving: false,
})
