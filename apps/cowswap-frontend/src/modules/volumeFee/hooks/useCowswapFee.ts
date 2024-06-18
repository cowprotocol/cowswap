import { useAtomValue } from 'jotai/index'

import { cowSwapFeeAtom } from '../state/cowswapFeeAtom'

export function useCowswapFee() {
  return useAtomValue(cowSwapFeeAtom)
}
