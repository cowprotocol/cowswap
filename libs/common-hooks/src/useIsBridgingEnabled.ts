import { atom, useAtomValue, useSetAtom } from 'jotai'

const isBridgingEnabledAtom = atom(false)

export function useIsBridgingEnabled(): boolean {
  return useAtomValue(isBridgingEnabledAtom)
}

export function useSetIsBridgingEnabled(): (value: boolean) => void {
  return useSetAtom(isBridgingEnabledAtom)
}
