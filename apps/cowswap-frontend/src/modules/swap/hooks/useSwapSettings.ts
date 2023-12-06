import { useAtomValue } from 'jotai'

import { swapSettingsAtom, SwapSettingsState } from '../state/swapSettingsAtom'

export function useSwapSettings(): SwapSettingsState {
  return useAtomValue(swapSettingsAtom)
}
