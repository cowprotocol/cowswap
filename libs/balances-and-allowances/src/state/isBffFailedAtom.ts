import { useSetAtom } from 'jotai'
import { atom, useAtomValue } from 'jotai/index'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

export const isBffFailedAtom = atom(false)

export function useIsBffFailed(): boolean {
  return useAtomValue(isBffFailedAtom)
}

export function useSetIsBffFailed(): (value: boolean) => void {
  return useSetAtom(isBffFailedAtom)
}

// Store chains that returned "Unsupported chain" error to prevent retries (runtime only, not persisted)
export const bffUnsupportedChainsAtom = atom(new Set<SupportedChainId>())

export function useBffUnsupportedChains(): Set<SupportedChainId> {
  return useAtomValue(bffUnsupportedChainsAtom)
}

export function useAddUnsupportedChainId(): (chainId: SupportedChainId) => void {
  const setAtom = useSetAtom(bffUnsupportedChainsAtom)
  return (chainId) => {
    setAtom((prev) => {
      if (prev.has(chainId)) {
        return prev
      }
      return new Set([...prev, chainId])
    })
  }
}
