import { useSetAtom } from 'jotai'
import { atom, useAtomValue } from 'jotai/index'

export const isBffFailedAtom = atom(false)

export function useIsBffFailed(): boolean {
  return useAtomValue(isBffFailedAtom)
}

export function useSetIsBffFailed(): (value: boolean) => void {
  return useSetAtom(isBffFailedAtom)
}
