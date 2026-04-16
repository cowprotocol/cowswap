import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

const nonEvmReceiverConfirmedAtom = atom(false)

export function useNonEvmReceiverConfirmed(): boolean {
  return useAtomValue(nonEvmReceiverConfirmedAtom)
}

export function useSetNonEvmReceiverConfirmed(): (v: boolean) => void {
  const setState = useSetAtom(nonEvmReceiverConfirmedAtom)

  return useCallback(
    (v: boolean) => {
      setState(v)
    },
    [setState],
  )
}
