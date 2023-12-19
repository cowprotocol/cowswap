import { useAtomValue } from 'jotai/index'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import { limitOrdersRawStateAtom } from '../state/limitOrdersRawStateAtom'

export function useIsWidgetUnlocked(): boolean {
  const rawState = useAtomValue(limitOrdersRawStateAtom)

  return rawState.isUnlocked || isInjectedWidget()
}
