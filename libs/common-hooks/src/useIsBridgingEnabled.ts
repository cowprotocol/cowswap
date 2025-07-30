import { atom, /* useAtomValue, */ useSetAtom } from 'jotai'

const isBridgingEnabledAtom = atom(false)

export function useIsBridgingEnabled(): boolean {
  // Force bridging to be enabled for testing
  return true
  // return useAtomValue(isBridgingEnabledAtom)
}

export function useSetIsBridgingEnabled(): (value: boolean) => void {
  return useSetAtom(isBridgingEnabledAtom)
}
