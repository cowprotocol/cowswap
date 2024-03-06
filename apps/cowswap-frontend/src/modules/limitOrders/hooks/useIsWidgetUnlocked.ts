import { isInjectedWidget } from '@cowprotocol/common-utils'

import { useLimitOrdersRawState } from './useLimitOrdersRawState'

export function useIsWidgetUnlocked(): boolean {
  const rawState = useLimitOrdersRawState()

  return rawState.isUnlocked || isInjectedWidget()
}
