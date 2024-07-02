import { useAtomValue } from 'jotai'

import { volumeFeeAtom } from '../state/volumeFeeAtom'

export function useVolumeFee() {
  return useAtomValue(volumeFeeAtom)
}
