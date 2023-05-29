import { atom, useAtomValue } from 'jotai'

import { Currency } from '@uniswap/sdk-core'

interface ZeroApprovalState {
  isApproving: boolean
  currency?: Currency
}

export const zeroApprovalState = atom<ZeroApprovalState>({
  isApproving: false,
})

export function useZeroApprovalState() {
  return useAtomValue(zeroApprovalState)
}
