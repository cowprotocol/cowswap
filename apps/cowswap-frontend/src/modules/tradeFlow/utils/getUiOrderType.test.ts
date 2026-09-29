import { UiOrderType } from '@cowprotocol/types'

import { TradeType } from 'common/modules/tradeNavigation'

import { getUiOrderType } from './getUiOrderType'

describe('getUiOrderType', () => {
  it('maps a trade type to its UI order type', () => {
    expect(getUiOrderType(TradeType.SWAP)).toBe(UiOrderType.SWAP)
    expect(getUiOrderType(TradeType.LIMIT_ORDER)).toBe(UiOrderType.LIMIT)
  })

  it('returns null when the trade type is unknown', () => {
    expect(getUiOrderType(undefined)).toBeNull()
  })
})
