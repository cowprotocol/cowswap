import { buildTwapOrderInfoListFromSafeData } from './useAllTwapOrdersInfo'

describe('buildTwapOrderInfoListFromSafeData', () => {
  it('returns an empty list when Safe returns no rows', () => {
    expect(buildTwapOrderInfoListFromSafeData([])).toEqual([])
  })
})
