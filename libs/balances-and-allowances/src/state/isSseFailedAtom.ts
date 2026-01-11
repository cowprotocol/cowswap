import { useSetAtom } from 'jotai'
import { atom, useAtomValue } from 'jotai/index'

export const isSseFailedAtom = atom(false)

export function useIsSseFailed(): boolean {
  return useAtomValue(isSseFailedAtom)
}

export function useSetIsSseFailed(): (value: boolean) => void {
  return useSetAtom(isSseFailedAtom)
}
