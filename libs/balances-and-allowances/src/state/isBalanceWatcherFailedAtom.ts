import { useSetAtom, atom, useAtomValue } from 'jotai'

export const isBalanceWatcherFailedAtom = atom(false)

export function useIsBalanceWatcherFailed(): boolean {
  return useAtomValue(isBalanceWatcherFailedAtom)
}

export function useSetIsBalanceWatcherFailed(): (value: boolean) => void {
  return useSetAtom(isBalanceWatcherFailedAtom)
}
