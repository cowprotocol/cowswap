import { Order } from 'legacy/state/orders/actions'

import { useOrderValidFrom } from './useOrderValidFrom'

const API_VALID_FROM = 1_795_621_800
const SNAPSHOT = 1_700_000_200
const APP_DATA_VALID_FROM = 1_700_000_100

const FULL_APP_DATA = JSON.stringify({
  version: '1.15.0',
  appCode: 'CoW Swap',
  metadata: { validFrom: APP_DATA_VALID_FROM },
})

function order(overrides: Partial<Order>): Order {
  return overrides as Order
}

describe('useOrderValidFrom', () => {
  it('prefers a finite API validFrom over the placement snapshot and app-data', () => {
    expect(
      useOrderValidFrom(
        order({
          apiAdditionalInfo: { validFrom: API_VALID_FROM } as Order['apiAdditionalInfo'],
          waitAndSaveNextBatch: SNAPSHOT,
          fullAppData: FULL_APP_DATA,
        }),
      ),
    ).toBe(API_VALID_FROM)
  })

  it('uses the placement snapshot while API validFrom is null', () => {
    expect(
      useOrderValidFrom(
        order({
          apiAdditionalInfo: { validFrom: null } as Order['apiAdditionalInfo'],
          waitAndSaveNextBatch: SNAPSHOT,
          fullAppData: FULL_APP_DATA,
        }),
      ),
    ).toBe(SNAPSHOT)
  })

  it('falls back to app-data validFrom when the API value and the snapshot are missing', () => {
    expect(
      useOrderValidFrom(
        order({
          apiAdditionalInfo: { validFrom: null } as Order['apiAdditionalInfo'],
          fullAppData: FULL_APP_DATA,
        }),
      ),
    ).toBe(APP_DATA_VALID_FROM)
  })
})
