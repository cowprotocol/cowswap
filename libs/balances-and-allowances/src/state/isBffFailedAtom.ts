import { useSetAtom } from 'jotai'
import { atom, useAtomValue } from 'jotai/index'
import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

export const isBffFailedAtom = atom(false)

export function useIsBffFailed(): boolean {
  return useAtomValue(isBffFailedAtom)
}

export function useSetIsBffFailed(): (value: boolean) => void {
  return useSetAtom(isBffFailedAtom)
}

export const bffUnsupportedChainsAtom = atom(new Set<SupportedChainId>())

export function useAddUnsupportedChainId(): (chainId: SupportedChainId) => void {
  const setAtom = useSetAtom(bffUnsupportedChainsAtom)
  return useCallback(
    (chainId) => {
      setAtom((prev) => {
        if (prev.has(chainId)) {
          return prev
        }
        return new Set([...prev, chainId])
      })
    },
    [setAtom]
  )
}
