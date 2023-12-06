import { useSetAtom } from 'jotai'

import { updateSwapSettingsAtom } from '../state/swapSettingsAtom'

export function useUpdateSwapSettings() {
  return useSetAtom(updateSwapSettingsAtom)
}
