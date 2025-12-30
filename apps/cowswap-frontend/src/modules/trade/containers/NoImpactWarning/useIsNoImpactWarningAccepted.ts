import { atom, useAtomValue } from 'jotai'

export const noImpactWarningAcceptedAtom = atom(false)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useIsNoImpactWarningAccepted() {
  return useAtomValue(noImpactWarningAcceptedAtom)
}
