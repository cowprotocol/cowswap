import { atom } from 'jotai'

import { Currency } from '@cowprotocol/common-entities'

export interface ZeroApprovalState {
  isApproving: boolean
  currency?: Currency
}

export const zeroApprovalState = atom<ZeroApprovalState>({
  isApproving: false,
})
