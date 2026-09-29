import { OrderClass } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'

import { getOrderTypeForLifecycleEvent, LifecycleOrderTypeSource } from './getOrderTypeForLifecycleEvent'

describe('getOrderTypeForLifecycleEvent', () => {
  it.each([
    {
      name: 'swap order',
      order: { class: OrderClass.MARKET },
      expected: UiOrderType.SWAP,
    },
    {
      name: 'limit order',
      order: { class: OrderClass.LIMIT },
      expected: UiOrderType.LIMIT,
    },
    {
      name: 'TWAP parent order',
      order: { class: OrderClass.LIMIT, composableCowInfo: { id: '0xparent' } },
      expected: UiOrderType.TWAP,
    },
    {
      name: 'TWAP child order',
      order: { class: OrderClass.LIMIT, composableCowInfo: { parentId: '0xparent', isVirtualPart: false } },
      expected: UiOrderType.TWAP,
    },
  ] satisfies { name: string; order: LifecycleOrderTypeSource; expected: UiOrderType }[])(
    'derives $expected for $name',
    ({ order, expected }) => {
      expect(getOrderTypeForLifecycleEvent(order)).toBe(expected)
    },
  )
})
