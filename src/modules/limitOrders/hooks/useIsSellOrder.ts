import { useMemo } from 'react'
import { useAtomValue } from 'jotai'

import { OrderKind } from '@cowprotocol/cow-sdk'
import { limitOrdersRawStateAtom } from 'modules/limitOrders/state/limitOrdersRawStateAtom'

// Returns boolean if the current order kind is SELL or BUY
export function useIsSellOrder(): boolean {
  const { orderKind } = useAtomValue(limitOrdersRawStateAtom)

  return useMemo(() => orderKind === OrderKind.SELL, [orderKind])
}
