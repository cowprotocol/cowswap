import { Currency } from '@uniswap/sdk-core'
import { atom, useAtomValue } from 'jotai'

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
