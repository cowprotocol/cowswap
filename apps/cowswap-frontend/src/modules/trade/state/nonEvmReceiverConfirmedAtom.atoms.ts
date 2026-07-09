import { atom, useAtomValue, useSetAtom } from 'jotai'

const nonEvmReceiverConfirmedAtom = atom(false)

export function useNonEvmReceiverConfirmed(): boolean {
  return useAtomValue(nonEvmReceiverConfirmedAtom)
}

export function useSetNonEvmReceiverConfirmed(): (v: boolean) => void {
  return useSetAtom(nonEvmReceiverConfirmedAtom)
}
