import { useMemo } from 'react'
import { useAtomValue } from 'jotai'

import { OrderKind } from '@cowprotocol/cow-sdk'
import { limitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'

// Returns boolean if the current order kind is SELL or BUY
export function useIsSellOrder(): boolean {
  const { orderKind } = useAtomValue(limitOrdersAtom)

  return useMemo(() => orderKind === OrderKind.SELL, [orderKind])
}
