import { useAdvancedOrdersRawState } from './useAdvancedOrdersRawState'

import { AdvancedOrdersRawState } from '../state/advancedOrdersAtom'

export function useIsWidgetUnlocked(): boolean {
  const rawState = useAdvancedOrdersRawState() as AdvancedOrdersRawState

  return rawState.isUnlocked
}
