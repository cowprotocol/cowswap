import { useSetAtom, atom, useAtomValue } from 'jotai'

export const isBffFailedAtom = atom(false)

export function useIsBffFailed(): boolean {
  return useAtomValue(isBffFailedAtom)
}

export function useSetIsBffFailed(): (value: boolean) => void {
  return useSetAtom(isBffFailedAtom)
}
