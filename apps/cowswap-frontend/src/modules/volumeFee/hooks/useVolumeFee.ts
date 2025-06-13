import { useAtomValue } from 'jotai'

import { volumeFeeAtom } from '../state/volumeFeeAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useVolumeFee() {
  return useAtomValue(volumeFeeAtom)
}
